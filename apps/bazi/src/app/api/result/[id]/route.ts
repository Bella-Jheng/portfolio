import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../../lib/firebase';

import { answerCustomQuestion } from '../../../lib/anthropic';
import { getDominantElements, calculateMajorFortune, getAnnualPillar, STEMS, BRANCHES } from '../../../lib/bazi-calculator';
import { VIEWED_READING_COOKIE } from '../../../lib/cookies';
import type { AskQuestionRequest, BaziPillars, FortuneReading, QuestionAnswer } from '../../../types/bazi';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

function resolveTimezone(header: string | null): string {
  const fallback = 'Asia/Taipei';
  if (!header) return fallback;
  try {
    Intl.DateTimeFormat('sv-SE', { timeZone: header });
    return header;
  } catch {
    return fallback;
  }
}

function getLocalToday(tz: string): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: tz });
}

function toLocalDateStr(isoStr: string, tz: string): string {
  return new Date(isoStr).toLocaleDateString('sv-SE', { timeZone: tz });
}

async function countTodayQuestionsForUser(userId: string, tz: string): Promise<number> {
  const today = getLocalToday(tz);
  const snapshot = await db.collection('readings').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const qs = (doc.data().questions ?? []) as QuestionAnswer[];
    count += qs.filter(qa => qa.userId === userId && toLocalDateStr(qa.createdAt, tz) === today).length;
  }
  return count;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await db.collection('readings').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const docData = doc.data();
    if (!docData) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }
    const { createdBy, adminQuestions: rawAdminQs, ...data } = docData;
    const sanitizedQuestions = (data.questions ?? []).map(
      ({ userId: _uid, ...q }: { userId?: string; [k: string]: unknown }) => q,
    );

    const userId = await extractUid(request);
    const isAdmin = !!userId && userId === ADMIN_UID;
    const tz = resolveTimezone(request.headers.get('X-Timezone'));
    const remainingToday = userId && !isAdmin
      ? Math.max(0, 3 - (await countTodayQuestionsForUser(userId, tz)))
      : null;

    const adminQuestions = isAdmin
      ? (rawAdminQs ?? []).map(({ userId: _uid, ...q }: { userId?: string; [k: string]: unknown }) => q)
      : undefined;

    const response = NextResponse.json(
      { id: doc.id, ...data, questions: sanitizedQuestions, ...(adminQuestions !== undefined && { adminQuestions }), remainingToday },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );

    // 本人看過結果後才鎖定「一人一次」限制；session cookie 隨瀏覽器關閉失效，不需另外查資料庫欄位
    if (userId && !isAdmin && userId === createdBy) {
      response.cookies.set(VIEWED_READING_COOKIE, doc.id, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Get result error:', error);
    return NextResponse.json({ error: '讀取命盤失敗' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await extractUid(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登入才能提問' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as AskQuestionRequest;
    const { question } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: '請輸入問題' }, { status: 400 });
    }

    const doc = await db.collection('readings').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }
    const pillars = data.pillars as BaziPillars;
    const fortune = data.fortune as FortuneReading;

    const isAdmin = userId === ADMIN_UID;
    const { adminQuestion } = body;

    if (adminQuestion && !isAdmin) {
      return NextResponse.json({ error: '無權限' }, { status: 403 });
    }

    const tz = resolveTimezone(request.headers.get('X-Timezone'));

    if (!adminQuestion) {
      const todayCount = await countTodayQuestionsForUser(userId, tz);
      if (!isAdmin && todayCount >= 3) {
        return NextResponse.json({ error: '今日提問已達上限（3 題），明天再來吧！', todayCount }, { status: 429 });
      }
    }

    // Compute current major fortune cycle for richer Q&A context
    let majorFortuneInfo: { currentCycle: string; currentAnnual: string } | undefined;
    const yearStemIndex = STEMS.indexOf(pillars.year?.stem ?? '');
    const monthStemIndex = STEMS.indexOf(pillars.month?.stem ?? '');
    const monthBranchIndex = BRANCHES.indexOf(pillars.month?.branch ?? '');
    if (yearStemIndex >= 0 && monthStemIndex >= 0 && monthBranchIndex >= 0 && data.gender) {
      const majorFortune = calculateMajorFortune(
        data.birthYear, data.birthMonth, data.birthDay,
        data.gender as 'male' | 'female',
        yearStemIndex, monthStemIndex, monthBranchIndex,
      );
      const currentYear = new Date().getFullYear();
      const virtualAge = currentYear - data.birthYear + 1;
      const cycleIdx = majorFortune.cycles.findLastIndex((cycle) => cycle.startAge <= virtualAge);
      const currentCycleData = cycleIdx >= 0 ? majorFortune.cycles[cycleIdx] : null;
      const annual = getAnnualPillar(currentYear);
      if (currentCycleData) {
        majorFortuneInfo = {
          currentCycle: `${currentCycleData.stem}${currentCycleData.branch}（起運歲 ${currentCycleData.startAge}，${currentCycleData.startYear} 年起）`,
          currentAnnual: `${annual.stem}${annual.branch}（${currentYear} 年）`,
        };
      }
    }

    const dominantElements = getDominantElements(pillars);
    const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

    let knowledgeDocs = (
      await db.collection('knowledge').where('tags', 'array-contains-any', queryTags).get()
    ).docs;

    if (knowledgeDocs.length < 3) {
      const all = await db.collection('knowledge').orderBy('createdAt', 'asc').limit(20).get();
      const existing = new Set(knowledgeDocs.map(doc => doc.id));
      knowledgeDocs = [...knowledgeDocs, ...all.docs.filter(doc => !existing.has(doc.id))];
    }

    const knowledge = knowledgeDocs
      .map((doc) => doc.data())
      .map((kd) => `【${kd['title']}】\n${kd['content']}`)
      .join('\n\n');

    const answer = await answerCustomQuestion({
      question,
      pillars,
      fortune,
      knowledge,
      name: data.name ?? undefined,
      gender: data.gender ?? undefined,
      majorFortuneInfo,
    });

    const newQA: QuestionAnswer = {
      question,
      answer,
      createdAt: new Date().toISOString(),
      userId,
    };

    if (adminQuestion) {
      const existingAdminQs = (data.adminQuestions ?? []) as QuestionAnswer[];
      const updatedAdminQs = [...existingAdminQs, newQA];
      await db.collection('readings').doc(id).update({
        adminQuestions: updatedAdminQs,
        updatedAt: new Date().toISOString(),
      });
      const sanitized = updatedAdminQs.map(({ userId: _uid, ...q }) => q);
      return NextResponse.json(
        { answer, adminQuestions: sanitized },
        { headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const existingQuestions = (data.questions ?? []) as QuestionAnswer[];
    const updatedQuestions = [...existingQuestions, newQA];
    await db.collection('readings').doc(id).update({
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });

    const todayCount = updatedQuestions.filter(
      qa => qa.userId === userId && toLocalDateStr(qa.createdAt, tz) === getLocalToday(tz)
    ).length;
    const sanitized = updatedQuestions.map(({ userId: _uid, ...q }) => q);
    const remaining = isAdmin ? null : Math.max(0, 3 - todayCount);
    return NextResponse.json(
      { answer, questions: sanitized, remainingToday: remaining },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error) {
    console.error('Ask question error:', error);
    const aiStatusText = (error as { statusText?: string })?.statusText;
    return NextResponse.json(
      { error: '提問失敗，請稍後再試', ...(aiStatusText && { aiStatusText }) },
      { status: 500 },
    );
  }
}

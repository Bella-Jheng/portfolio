import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { getAuth } from 'firebase-admin/auth';
import { answerCustomQuestion } from '../../../lib/anthropic';
import { getDominantElements } from '../../../lib/bazi-calculator';
import type { AskQuestionRequest, BaziPillars, FortuneReading, QuestionAnswer } from '../../../types/bazi';

async function extractUid(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function countTodayQuestionsForUser(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const snapshot = await db.collection('readings').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const qs = (doc.data().questions ?? []) as QuestionAnswer[];
    count += qs.filter(q => q.userId === userId && q.createdAt.startsWith(today)).length;
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

    const { createdBy: _createdBy, ...data } = doc.data()!;
    const sanitizedQuestions = (data.questions ?? []).map(
      ({ userId: _uid, ...q }: { userId?: string; [k: string]: unknown }) => q,
    );

    const userId = await extractUid(request);
    const remainingToday = userId
      ? Math.max(0, 3 - (await countTodayQuestionsForUser(userId)))
      : null;

    return NextResponse.json({ id: doc.id, ...data, questions: sanitizedQuestions, remainingToday });
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

    const data = doc.data()!;
    const pillars = data.pillars as BaziPillars;
    const fortune = data.fortune as FortuneReading;
    const existingQuestions = (data.questions ?? []) as QuestionAnswer[];

    const todayCount = await countTodayQuestionsForUser(userId);
    if (todayCount >= 3) {
      return NextResponse.json({ error: '今日提問已達上限（3 題），明天再來吧！', todayCount }, { status: 429 });
    }

    const dominantElements = getDominantElements(pillars);
    const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

    let knowledgeDocs = (
      await db.collection('knowledge').where('tags', 'array-contains-any', queryTags).get()
    ).docs;

    if (knowledgeDocs.length < 3) {
      const all = await db.collection('knowledge').orderBy('createdAt', 'asc').limit(20).get();
      const existing = new Set(knowledgeDocs.map(d => d.id));
      knowledgeDocs = [...knowledgeDocs, ...all.docs.filter(d => !existing.has(d.id))];
    }

    const knowledge = knowledgeDocs
      .map((d) => d.data())
      .map((kd) => `【${kd['title']}】\n${kd['content']}`)
      .join('\n\n');

    const answer = await answerCustomQuestion({
      question,
      pillars,
      fortune,
      knowledge,
      name: data.name ?? undefined,
      gender: data.gender ?? undefined,
    });

    const newQA: QuestionAnswer = {
      question,
      answer,
      createdAt: new Date().toISOString(),
      userId,
    };

    const updatedQuestions = [...existingQuestions, newQA];

    await db.collection('readings').doc(id).update({
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });

    const sanitized = updatedQuestions.map(({ userId: _uid, ...q }) => q);
    const remaining = Math.max(0, 3 - (todayCount + 1));
    return NextResponse.json({ answer, questions: sanitized, remainingToday: remaining });
  } catch (error) {
    console.error('Ask question error:', error);
    return NextResponse.json({ error: '提問失敗，請稍後再試' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../../../lib/firebase';
import { generateBaziReading } from '../../../../lib/anthropic';
import {
  calculateBaziPillars,
  getDominantElements,
  calculateMajorFortune,
  getAnnualPillar,
  STEMS,
  BRANCHES,
} from '../../../../lib/bazi-calculator';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || !ADMIN_UID) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid === ADMIN_UID;
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const doc = await db.collection('readings').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: '找不到此命盤' }, { status: 404 });
    }

    const data = doc.data()!;
    const { correctionRequestedDate, name, gender, questions } = data;

    if (!correctionRequestedDate) {
      return NextResponse.json({ error: '找不到申請的日期資料' }, { status: 400 });
    }

    const { year: birthYear, month: birthMonth, day: birthDay, hour: birthHour } =
      correctionRequestedDate as { year: number; month: number; day: number; hour: number | null };

    const pillars = calculateBaziPillars(birthYear, birthMonth, birthDay, birthHour ?? undefined);
    const dominantElements = getDominantElements(pillars);
    const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

    let knowledgeDocs = (
      await db.collection('knowledge').where('tags', 'array-contains-any', queryTags).get()
    ).docs;

    if (knowledgeDocs.length < 3) {
      const all = await db.collection('knowledge').orderBy('createdAt', 'asc').limit(20).get();
      const existing = new Set(knowledgeDocs.map((doc) => doc.id));
      knowledgeDocs = [...knowledgeDocs, ...all.docs.filter((doc) => !existing.has(doc.id))];
    }

    const knowledge = knowledgeDocs
      .map((doc) => doc.data())
      .map((kd) => `【${kd['title']}】\n${kd['content']}`)
      .join('\n\n');

    const currentYear = new Date().getFullYear();
    const yearStemIdx = STEMS.indexOf(pillars.year.stem);
    const monthStemIdx = STEMS.indexOf(pillars.month.stem);
    const monthBranchIdx = BRANCHES.indexOf(pillars.month.branch);
    let majorFortuneInfo: { currentCycle: string; currentAnnual: string } | undefined;
    if (gender && yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0) {
      const mf = calculateMajorFortune(
        birthYear, birthMonth, birthDay, gender,
        yearStemIdx, monthStemIdx, monthBranchIdx,
      );
      const virtualAge = currentYear - birthYear + 1;
      const cycleIdx = mf.cycles.findLastIndex((cycle) => cycle.startAge <= virtualAge);
      const cycle = cycleIdx >= 0 ? mf.cycles[cycleIdx] : null;
      const annual = getAnnualPillar(currentYear);
      majorFortuneInfo = {
        currentCycle: cycle
          ? `${cycle.stem}${cycle.branch}（起運歲 ${cycle.startAge}，${cycle.startYear} 年起）`
          : '尚未入大運',
        currentAnnual: `${annual.stem}${annual.branch}（${currentYear} 年）`,
      };
    }

    const fortune = await generateBaziReading({
      name: name ?? undefined,
      gender: gender ?? undefined,
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? undefined,
      pillars,
      knowledge,
      currentYear,
      majorFortuneInfo,
    });

    await db.collection('readings').doc(id).update({
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? null,
      pillars,
      fortune,
      correctionRequested: false,
      correctionApproved: true,
      correctionApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const sanitizedQuestions = (questions ?? []).map(
      ({ userId: _uid, ...q }: { userId?: string; [k: string]: unknown }) => q,
    );

    return NextResponse.json({
      pillars,
      fortune,
      questions: sanitizedQuestions,
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? null,
    });
  } catch (error) {
    console.error('Approve correction error:', error);
    return NextResponse.json({ error: '同意更改失敗，請稍後再試' }, { status: 500 });
  }
}

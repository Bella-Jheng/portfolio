import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../lib/firebase';

import { generateBaziReading } from '../../lib/anthropic';
import { calculateBaziPillars, getDominantElements, calculateMajorFortune, getAnnualPillar, STEMS, BRANCHES } from '../../lib/bazi-calculator';
import type { CalculateRequest } from '../../types/bazi';
import { v4 as uuidv4 } from 'uuid';

async function extractUid(request: NextRequest): Promise<string | null> {
  const auth = getAdminAuth();
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const createdBy = await extractUid(request);
    const body = (await request.json()) as CalculateRequest;
    const { name, gender, birthYear, birthMonth, birthDay, birthHour } = body;

    // If the user already has a reading, return it without recalculating
    if (createdBy) {
      const existing = await db
        .collection('readings')
        .where('createdBy', '==', createdBy)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (!existing.empty) {
        const doc = existing.docs[0];
        return NextResponse.json({ id: doc.id, ...doc.data() });
      }
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: '請填寫姓名' }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ error: '請選擇性別' }, { status: 400 });
    }
    if (!birthYear || !birthMonth || !birthDay) {
      return NextResponse.json({ error: '請提供完整的出生年月日' }, { status: 400 });
    }

    const pillars = calculateBaziPillars(birthYear, birthMonth, birthDay, birthHour);

    const dominantElements = getDominantElements(pillars);
    const queryTags = [...dominantElements, '桃花', '財運', '健康', '事業', '運勢', '通用'];

    let knowledgeDocs = (
      await db.collection('knowledge').where('tags', 'array-contains-any', queryTags).get()
    ).docs;

    // 尚未有標籤的舊資料 fallback
    if (knowledgeDocs.length < 3) {
      const all = await db.collection('knowledge').orderBy('createdAt', 'asc').limit(20).get();
      const existing = new Set(knowledgeDocs.map(d => d.id));
      knowledgeDocs = [...knowledgeDocs, ...all.docs.filter(d => !existing.has(d.id))];
    }

    const knowledge = knowledgeDocs
      .map((doc) => {
        const d = doc.data();
        return `【${d.title}】\n${d.content}`;
      })
      .join('\n\n');

    const currentYear = new Date().getFullYear();
    const yearStemIdx = STEMS.indexOf(pillars.year.stem);
    const monthStemIdx = STEMS.indexOf(pillars.month.stem);
    const monthBranchIdx = BRANCHES.indexOf(pillars.month.branch);
    let majorFortuneInfo: { currentCycle: string; currentAnnual: string } | undefined;
    if (gender && yearStemIdx >= 0 && monthStemIdx >= 0 && monthBranchIdx >= 0) {
      const mf = calculateMajorFortune(birthYear, birthMonth, birthDay, gender, yearStemIdx, monthStemIdx, monthBranchIdx);
      const virtualAge = currentYear - birthYear + 1;
      const cycleIdx = mf.cycles.findLastIndex((c) => c.startAge <= virtualAge);
      const cycle = cycleIdx >= 0 ? mf.cycles[cycleIdx] : null;
      const annual = getAnnualPillar(currentYear);
      majorFortuneInfo = {
        currentCycle: cycle ? `${cycle.stem}${cycle.branch}（起運歲 ${cycle.startAge}，${cycle.startYear} 年起）` : '尚未入大運',
        currentAnnual: `${annual.stem}${annual.branch}（${currentYear} 年）`,
      };
    }

    const fortune = await generateBaziReading({
      name,
      gender,
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      pillars,
      knowledge,
      currentYear,
      majorFortuneInfo,
    });

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.collection('readings').doc(id).set({
      name: name ?? null,
      gender: gender ?? null,
      birthYear,
      birthMonth,
      birthDay,
      birthHour: birthHour ?? null,
      pillars,
      fortune,
      questions: [],
      createdBy: createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id, pillars, fortune });
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: '命盤計算失敗，請稍後再試' }, { status: 500 });
  }
}

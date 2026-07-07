import { NextRequest, NextResponse } from 'next/server';
import { db, getAdminAuth } from '../../lib/firebase';

import { generateBaziReading } from '../../lib/anthropic';
import { calculateBaziPillars } from '../../lib/bazi-calculator';
import { buildReadingGenerationContext } from '../../lib/reading-context';
import { VIEWED_READING_COOKIE } from '../../lib/cookies';
import { resolveResubmitAction, type ExistingReadingInput } from '../../lib/reading-resubmit';
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

const ADMIN_UID = process.env.ADMIN_UID ?? '';

export async function POST(request: NextRequest) {
  try {
    const createdBy = await extractUid(request);
    const isAdmin = !!ADMIN_UID && createdBy === ADMIN_UID;
    const body = (await request.json()) as CalculateRequest;
    const { name, gender, birthYear, birthMonth, birthDay, birthHour } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '請填寫姓名' }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json({ error: '請選擇性別' }, { status: 400 });
    }
    if (!birthYear || !birthMonth || !birthDay) {
      return NextResponse.json({ error: '請提供完整的出生年月日' }, { status: 400 });
    }

    // Admin can always create new readings; regular users are limited to one
    let overwriteId: string | null = null;
    if (createdBy && !isAdmin) {
      const existing = await db
        .collection('readings')
        .where('createdBy', '==', createdBy)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (!existing.empty) {
        const doc = existing.docs[0];
        const data = doc.data();
        const hasBeenViewed = request.cookies.get(VIEWED_READING_COOKIE)?.value === doc.id;
        const action = resolveResubmitAction(
          data as ExistingReadingInput,
          { name, gender, birthYear, birthMonth, birthDay, birthHour },
          hasBeenViewed,
        );

        // 已經看過結果，或這次送出的資料跟既有命盤相同：維持一人一次限制，直接回傳既有命盤
        if (action === 'reuse') {
          return NextResponse.json(
            { id: doc.id },
            { headers: { 'Cache-Control': 'no-store, private' } },
          );
        }

        // 尚未看過結果、且這次資料不同：視為填錯重填，覆蓋既有命盤重新計算
        overwriteId = doc.id;
      }
    }

    const pillars = calculateBaziPillars(birthYear, birthMonth, birthDay, birthHour);

    const { knowledge, currentYear, majorFortuneInfo, strength } = await buildReadingGenerationContext(
      pillars, birthYear, birthMonth, birthDay, gender,
    );

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
      strength,
    });

    const now = new Date().toISOString();

    if (overwriteId) {
      await db.collection('readings').doc(overwriteId).update({
        name: name ?? null,
        gender: gender ?? null,
        birthYear,
        birthMonth,
        birthDay,
        birthHour: birthHour ?? null,
        pillars,
        fortune,
        updatedAt: now,
      });

      return NextResponse.json(
        { id: overwriteId },
        { headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    const id = uuidv4();

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
      createdBy: isAdmin ? null : (createdBy ?? null),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { id },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json({ error: '命盤計算失敗，請稍後再試' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../lib/firebase';
import { readingService } from '../../lib/services/reading-service';
import { VIEWED_READING_COOKIE } from '../../lib/cookies';
import type { CalculateRequest } from '../../types/bazi';

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

    const { id } = await readingService.createOrReuse({
      createdBy,
      isAdmin,
      input: { name, gender, birthYear, birthMonth, birthDay, birthHour },
      hasBeenViewed: (readingId: string) => request.cookies.get(VIEWED_READING_COOKIE)?.value === readingId,
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

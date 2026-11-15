import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';
import { DEFAULT_REMINDER_OFFSETS, normalizeOffsets } from '../../../../lib/reminders';

/** 提前幾分鐘提醒（沒設定過回傳預設值） */
export async function GET(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const offsets = (await user.repos.notifications.getReminderOffsets(user.uid)) ?? DEFAULT_REMINDER_OFFSETS;
  return NextResponse.json({ offsets }, { headers: { 'Cache-Control': 'no-store, private' } });
}

export async function PUT(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const body = (await request.json().catch(() => null)) as { offsets?: unknown } | null;
  const offsets = normalizeOffsets(body?.offsets);
  if (!offsets) return NextResponse.json({ error: '提醒時間格式錯誤（最多 5 個，最多提前 7 天）' }, { status: 400 });
  await user.repos.notifications.saveReminderOffsets(user.uid, offsets);
  return NextResponse.json({ offsets });
}

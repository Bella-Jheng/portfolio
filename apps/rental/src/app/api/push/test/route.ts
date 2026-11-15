import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';
import { isPushConfigured, sendToUser } from '../../../../lib/push-server';

/** 送一則測試通知到這個帳號的所有裝置，確認推播設定沒問題 */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  if (!isPushConfigured()) return NextResponse.json({ error: '伺服器還沒設定推播金鑰（VAPID）' }, { status: 500 });
  const sent = await sendToUser(user.repos.notifications, user.uid, {
    title: '租屋小幫手',
    body: '測試通知：看房提醒會像這樣出現 🏡',
    url: '/schedule',
    tag: 'test',
  });
  if (sent === 0) return NextResponse.json({ error: '沒有送達任何裝置，請先在這台裝置開啟通知' }, { status: 404 });
  return NextResponse.json({ sent });
}

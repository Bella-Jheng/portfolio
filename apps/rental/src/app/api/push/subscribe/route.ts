import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';
import type { PushSubscriptionRecord } from '../../../../lib/data/types';

function parseSubscription(value: unknown): PushSubscriptionRecord | null {
  const s = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | null;
  if (!s || typeof s.endpoint !== 'string' || !/^https:\/\//.test(s.endpoint)) return null;
  if (typeof s.keys?.p256dh !== 'string' || typeof s.keys?.auth !== 'string') return null;
  return { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } };
}

/** 這台裝置開啟看房提醒：記下瀏覽器給的推播訂閱 */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const subscription = parseSubscription(await request.json().catch(() => null));
  if (!subscription) return NextResponse.json({ error: '推播訂閱格式錯誤' }, { status: 400 });
  await user.repos.notifications.saveSubscription(user.uid, subscription);
  return NextResponse.json({ ok: true });
}

/** 這台裝置關閉看房提醒 */
export async function DELETE(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (typeof body?.endpoint !== 'string') return NextResponse.json({ error: '缺少 endpoint' }, { status: 400 });
  // 只能刪自己的：確認這個 endpoint 在自己的訂閱裡
  const mine = await user.repos.notifications.listSubscriptions(user.uid);
  if (mine.some((s) => s.endpoint === body.endpoint)) await user.repos.notifications.removeSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}

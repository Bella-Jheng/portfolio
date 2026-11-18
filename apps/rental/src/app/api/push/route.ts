import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';
import { pushConfigured } from '../../../lib/push-notify';

type Body = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

function isPushEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** 這台裝置開啟推播：存下瀏覽器給的訂閱（PushSubscription.toJSON()） */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  if (!pushConfigured()) return NextResponse.json({ error: '伺服器還沒設定推播通知' }, { status: 501 });

  const body = (await request.json().catch(() => null)) as Body | null;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!isPushEndpoint(body?.endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return NextResponse.json({ error: '訂閱資料格式錯誤' }, { status: 400 });
  }
  await user.repos.pushSubscriptions.save(user.uid, { endpoint: body.endpoint as string, p256dh, auth });
  return NextResponse.json({ ok: true });
}

/** 這台裝置關閉推播 */
export async function DELETE(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!isPushEndpoint(body?.endpoint)) return NextResponse.json({ error: '訂閱資料格式錯誤' }, { status: 400 });
  await user.repos.pushSubscriptions.remove(body.endpoint as string);
  return NextResponse.json({ ok: true });
}

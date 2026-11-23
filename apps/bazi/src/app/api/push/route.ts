import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../lib/verify-id-token';
import { pushSubscriptionsRepository } from '../../lib/repositories/push-subscriptions-repository';
import { pushConfigured } from '../../lib/push-notify';

type Body = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown }; locale?: unknown };

async function uidFrom(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return (await verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}

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
  const uid = await uidFrom(request);
  if (!uid) return NextResponse.json({ error: '請先登入' }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: '伺服器還沒設定推播通知' }, { status: 501 });

  const body = (await request.json().catch(() => null)) as Body | null;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!isPushEndpoint(body?.endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return NextResponse.json({ error: '訂閱資料格式錯誤' }, { status: 400 });
  }
  // 記下介面語言，之後的每月運勢、功能更新推播用同一種語言
  await pushSubscriptionsRepository.save(uid, { endpoint: body.endpoint as string, p256dh, auth }, body?.locale === 'en' ? 'en' : 'zh');
  return NextResponse.json({ ok: true });
}

/** 這台裝置關閉推播 */
export async function DELETE(request: NextRequest) {
  const uid = await uidFrom(request);
  if (!uid) return NextResponse.json({ error: '請先登入' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!isPushEndpoint(body?.endpoint)) return NextResponse.json({ error: '訂閱資料格式錯誤' }, { status: 400 });
  await pushSubscriptionsRepository.remove(body.endpoint as string);
  return NextResponse.json({ ok: true });
}

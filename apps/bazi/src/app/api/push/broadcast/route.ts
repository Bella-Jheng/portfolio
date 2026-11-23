import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../lib/verify-id-token';
import { pushConfigured } from '../../../lib/push-notify';
import { sendFeatureUpdatePush } from '../../../lib/push-campaigns';

const ADMIN_UID = process.env.ADMIN_UID ?? '';

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/** 管理員發送「功能更新」推播給所有開啟通知的裝置 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  let uid: string | null = null;
  try {
    uid = token ? (await verifyIdToken(token)).uid : null;
  } catch {
    uid = null;
  }
  if (!uid || !ADMIN_UID || uid !== ADMIN_UID) {
    return NextResponse.json({ error: '只有管理員可以發送' }, { status: 403 });
  }
  if (!pushConfigured()) return NextResponse.json({ error: '伺服器還沒設定推播通知' }, { status: 501 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const titleZh = text(body?.titleZh, 60);
  const bodyZh = text(body?.bodyZh, 200);
  if (!titleZh || !bodyZh) return NextResponse.json({ error: '請填寫中文標題和內容' }, { status: 400 });
  try {
    const result = await sendFeatureUpdatePush({
      titleZh,
      bodyZh,
      titleEn: text(body?.titleEn, 60) || undefined,
      bodyEn: text(body?.bodyEn, 200) || undefined,
      url: text(body?.url, 200) || undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Feature update push failed:', error);
    return NextResponse.json({ error: '發送失敗，請稍後再試' }, { status: 500 });
  }
}

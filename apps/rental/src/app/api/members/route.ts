import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 一起找房：我邀請了誰（members），以及誰邀請了我（owners） */
export async function GET(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const [members, owners] = await Promise.all([
    user.repos.members.listMembers(user.uid),
    user.repos.members.listOwners(user.email),
  ]);
  return NextResponse.json({ members, owners }, { headers: { 'Cache-Control': 'no-store, private' } });
}

/** 邀請別人共用我的清單（對方也要在白名單裡才能登入使用） */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: '請輸入正確的 email' }, { status: 400 });
  if (email === user.email) return NextResponse.json({ error: '不用邀請自己' }, { status: 400 });
  await user.repos.members.add(user.uid, user.email, email);
  return NextResponse.json({ ok: true });
}

/**
 * ?email=x：我把 x 從我的清單移除
 * ?owner=uid：我離開別人共用給我的清單
 */
export async function DELETE(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  const email = request.nextUrl.searchParams.get('email');
  const owner = request.nextUrl.searchParams.get('owner');
  if (email) await user.repos.members.remove(user.uid, email);
  else if (owner) await user.repos.members.remove(owner, user.email);
  else return NextResponse.json({ error: '缺少參數' }, { status: 400 });
  return NextResponse.json({ ok: true });
}

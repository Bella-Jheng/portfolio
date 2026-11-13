import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../../lib/verify-user';

type Params = { params: Promise<{ id: string }> };

/** 分享連結只有物件擁有者能產生或停止；共用來的物件不行 */
async function ownerOnly(request: NextRequest, params: Params['params']) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return { error: NextResponse.json({ error: user.error }, { status: user.status }) };
  const { id } = await params;
  const listing = await user.repos.listings.get(user.uid, id);
  if (!listing) {
    return { error: NextResponse.json({ error: '只有物件的擁有者能分享，或這間物件還沒同步到雲端' }, { status: 404 }) };
  }
  return { user, id };
}

export async function GET(request: NextRequest, { params }: Params) {
  const r = await ownerOnly(request, params);
  if ('error' in r) return r.error;
  const token = await r.user.repos.shareLinks.getToken(r.user.uid, r.id);
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store, private' } });
}

/** 產生分享連結（已經有就沿用同一個） */
export async function POST(request: NextRequest, { params }: Params) {
  const r = await ownerOnly(request, params);
  if ('error' in r) return r.error;
  try {
    let token = await r.user.repos.shareLinks.getToken(r.user.uid, r.id);
    if (!token) {
      // 128 位元隨機值，猜不到
      token = randomBytes(16).toString('base64url');
      await r.user.repos.shareLinks.create(r.user.uid, r.id, token);
    }
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Create share link failed:', error);
    return NextResponse.json({ error: '產生分享連結失敗，請稍後再試' }, { status: 500 });
  }
}

/** 停止分享：舊的連結立刻失效 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const r = await ownerOnly(request, params);
  if ('error' in r) return r.error;
  await r.user.repos.shareLinks.revoke(r.user.uid, r.id);
  return NextResponse.json({ ok: true });
}

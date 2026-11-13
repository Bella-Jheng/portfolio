import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';

/** 登入同步一開始呼叫：把這個帳號的 uid 和 email 對應記到資料庫 */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });
  try {
    await user.repos.users.recordLogin(user.uid, user.email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Record login failed:', error);
    return NextResponse.json({ error: '記錄登入失敗，請稍後再試' }, { status: 500 });
  }
}

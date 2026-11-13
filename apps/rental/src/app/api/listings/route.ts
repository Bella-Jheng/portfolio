import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';
import { listForUser } from '../../../lib/data/access';

/** 取得這個帳號的物件，加上別人共用給我的物件（新的在前） */
export async function GET(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  try {
    const listings = await listForUser(user.repos, user.uid, user.email);
    return NextResponse.json({ listings }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    console.error('List listings failed:', error);
    return NextResponse.json({ error: '讀取雲端資料失敗，請稍後再試' }, { status: 500 });
  }
}

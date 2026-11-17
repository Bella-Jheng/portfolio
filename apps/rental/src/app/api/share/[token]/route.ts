import { NextRequest, NextResponse } from 'next/server';
import { getSharedListing } from '../../../../lib/share';

/** 分享連結：不用登入，只回傳公開欄位（沒有備註、AI 標記、愛心） */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const notFound = NextResponse.json({ error: '這個分享連結已失效' }, { status: 404 });

  try {
    const listing = await getSharedListing(token);
    if (!listing) return notFound;
    return NextResponse.json({ listing }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Read shared listing failed:', error);
    return NextResponse.json({ error: '暫時無法讀取，請稍後再試' }, { status: 500 });
  }
}

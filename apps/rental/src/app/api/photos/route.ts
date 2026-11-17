import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../lib/verify-user';
import { PhotoError, uploadPhoto } from '../../../lib/photo-storage';

// 單張照片的 data URL；前端已縮圖，正常約 100–300KB
const MAX_BODY_BYTES = 3_000_000;

/** 上傳一張物件照片（data URL），回傳 Firebase Storage 的網址 */
export async function POST(request: NextRequest) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: '照片太大，請換一張' }, { status: 413 });
  }

  let body: { listingId?: unknown; dataUrl?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }
  if (typeof body.listingId !== 'string' || !body.listingId || typeof body.dataUrl !== 'string') {
    return NextResponse.json({ error: '資料格式錯誤' }, { status: 400 });
  }

  try {
    const url = await uploadPhoto(user.uid, body.listingId, body.dataUrl);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof PhotoError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Upload photo failed:', error);
    return NextResponse.json({ error: '照片上傳失敗，請稍後再試' }, { status: 500 });
  }
}

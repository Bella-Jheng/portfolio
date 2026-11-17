import { NextRequest, NextResponse } from 'next/server';
import { getSharedListing } from '../../../../lib/share';

/**
 * 分享預覽縮圖（og:image）。LINE 等平台只吃 http(s) 網址的圖片，不吃 data URL，
 * 所以由這裡把物件的照片轉成真的圖片回應：
 * - 首圖／截圖縮圖是 data URL：解碼後直接回傳
 * - 已經放在 Firebase Storage：轉址過去
 * - 都沒有、或連結失效：轉址到預設圖 /og-share.png
 */
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const STORAGE_HOST = 'firebasestorage.googleapis.com';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const fallback = NextResponse.redirect(new URL('/og-share.png', request.url), 302);

  let photo: string | undefined;
  try {
    const listing = await getSharedListing(token);
    photo = listing?.coverImage || listing?.thumbnail;
  } catch (error) {
    console.error('Share preview lookup failed:', error);
    return fallback;
  }
  if (!photo) return fallback;

  const match = DATA_URL.exec(photo);
  if (match) {
    return new NextResponse(Buffer.from(match[2], 'base64'), {
      headers: {
        'Content-Type': match[1],
        // 平台會快取預覽；換了首圖之後最慢一小時內更新
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // 只轉址到自己的 Storage，不當成任意網址的跳板
  try {
    const url = new URL(photo);
    if (url.protocol === 'https:' && url.hostname === STORAGE_HOST) return NextResponse.redirect(url, 302);
  } catch {
    /* 不是網址就用預設圖 */
  }
  return fallback;
}

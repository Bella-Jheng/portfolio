import { NextRequest, NextResponse } from 'next/server';
import { parseListingImages, validateImages, type ParseImage } from '../../../lib/listing-parser';
import { verifyUser } from '../../../lib/verify-user';

export const maxDuration = 60;

/** 同步解析：等 AI 解析完才回應。新版前端改用 /api/parse-jobs（可以切到背景），這支留給舊版頁面 */
export async function POST(request: NextRequest) {
  // 只有允許名單裡的 Google 帳號能呼叫 AI，避免網址外流後被別人消耗額度
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) {
    return NextResponse.json({ error: user.error }, { status: user.status });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '伺服器還沒設定 GOOGLE_AI_API_KEY' }, { status: 500 });
  }

  let images: ParseImage[];
  try {
    const body = (await request.json()) as { images?: ParseImage[] };
    images = body.images ?? [];
  } catch {
    return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 });
  }
  const invalid = validateImages(images);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    return NextResponse.json(await parseListingImages(apiKey, images));
  } catch (error) {
    console.error('Parse listing error:', error);
    return NextResponse.json({ error: 'AI 解析失敗，請再試一次' }, { status: 502 });
  }
}

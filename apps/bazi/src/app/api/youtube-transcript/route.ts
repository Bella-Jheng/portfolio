import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { getAuth } from 'firebase-admin/auth';

async function verifyUser(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  try {
    await getAuth().verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await verifyUser(request))) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  try {
    const { url } = await request.json() as { url: string };
    if (!url) return NextResponse.json({ error: '請提供 YouTube 網址' }, { status: 400 });

    const videoId = extractVideoId(url.trim());
    if (!videoId) return NextResponse.json({ error: '無法解析影片 ID，請確認網址格式' }, { status: 400 });

    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'zh-TW' })
      .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: 'zh' }))
      .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' }))
      .catch(() => YoutubeTranscript.fetchTranscript(videoId));

    const transcript = items.map(i => i.text).join('\n');

    // 用影片 ID 當 fallback 標題，讓前端覆蓋
    return NextResponse.json({ title: videoId, transcript, videoId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('disabled') || msg.includes('No transcript')) {
      return NextResponse.json({ error: '此影片沒有字幕，無法解析逐字稿' }, { status: 422 });
    }
    console.error('YouTube transcript error:', error);
    return NextResponse.json({ error: '解析失敗，請稍後再試' }, { status: 500 });
  }
}

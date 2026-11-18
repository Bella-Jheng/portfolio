import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '../../../../lib/verify-user';

// 超過這個時間還在「等待中」，代表背景解析被中止了（例如超過 Function 執行上限），當成失敗
const STALE_MS = 3 * 60 * 1000;

/** 查詢背景解析的進度：pending（還在跑）、done（附結果）、error（附原因）。只查得到自己的 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyUser(request.headers.get('authorization'));
  if (!user.ok) return NextResponse.json({ error: user.error }, { status: user.status });

  const { id } = await params;
  try {
    const job = await user.repos.parseJobs.get(user.uid, id);
    if (!job) return NextResponse.json({ error: '找不到這次解析，請重新上傳' }, { status: 404 });
    if (job.status === 'pending' && Date.now() - new Date(job.createdAt).getTime() > STALE_MS) {
      return NextResponse.json(
        { ...job, status: 'error', error: 'AI 解析太久沒有完成，請再試一次' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.json(job, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Read parse job failed:', error);
    return NextResponse.json({ error: '暫時讀不到解析結果，稍後會自動再試' }, { status: 500 });
  }
}

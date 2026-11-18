import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '../../../../lib/verify-id-token';
import { calcJobsRepository } from '../../../../lib/repositories/calc-jobs-repository';

// 超過這個時間還在「等待中」，代表背景排盤被中止了（例如超過 Function 執行上限），當成失敗
const STALE_MS = 10 * 60 * 1000;

/** 查背景排盤的進度：pending（還在算）、done（附 readingId）、error（附原因）。只查得到自己的 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  let uid: string;
  try {
    if (!token) throw new Error('no token');
    uid = (await verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: '請先登入' }, { status: 401 });
  }

  const { id } = await params;
  const headers = { 'Cache-Control': 'no-store, private' };
  try {
    const job = await calcJobsRepository.get(id, uid);
    if (!job) return NextResponse.json({ error: '找不到這次排盤，請重新送出' }, { status: 404, headers });
    if (job.status === 'pending' && Date.now() - new Date(job.createdAt).getTime() > STALE_MS) {
      return NextResponse.json({ status: 'error', error: '命盤計算太久沒有完成，請再試一次' }, { headers });
    }
    return NextResponse.json(
      { status: job.status, readingId: job.readingId, error: job.error },
      { headers },
    );
  } catch (error) {
    console.error('Read calc job failed:', error);
    return NextResponse.json({ error: '暫時讀不到結果，稍後會自動再試' }, { status: 500, headers });
  }
}

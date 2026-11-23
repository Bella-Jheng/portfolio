import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlyFortunePush } from '../../../lib/push-campaigns';

export const maxDuration = 120;

/**
 * 每月 1 號台灣時間 08:00（vercel.json 的 crons）推播「本月運勢出爐」。
 * 只送提醒，運勢等使用者點開結果頁才用 AI 產生。
 * Vercel 會帶 Authorization: Bearer <CRON_SECRET>；沒設定 CRON_SECRET 時不給執行。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await sendMonthlyFortunePush()) });
  } catch (error) {
    console.error('Monthly fortune push failed:', error);
    return NextResponse.json({ error: '每月運勢推播失敗' }, { status: 500 });
  }
}

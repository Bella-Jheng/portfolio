import { NextRequest, NextResponse } from 'next/server';
import { purgeDemoData } from '../../../lib/demo/demo-service';

export const maxDuration = 60;

/**
 * 每天清空訪客 Demo 的資料（vercel.json 的 crons 每天台灣時間 04:00 呼叫）。
 * Vercel 會帶 Authorization: Bearer <CRON_SECRET>；沒設定 CRON_SECRET 時不給執行。
 * 只刪 baziDemo* 集合和一天以上沒用的匿名帳號，正式的 readings 完全不碰。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await purgeDemoData()) });
  } catch (error) {
    console.error('Demo reset failed:', error);
    return NextResponse.json({ error: 'Demo 重置失敗' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '../../../../lib/data';
import { isPushConfigured, sendToUser } from '../../../../lib/push-server';
import { DEFAULT_REMINDER_OFFSETS, MAX_OFFSET_MINUTES, findDueReminders, formatOffset } from '../../../../lib/reminders';

export const maxDuration = 60;

/**
 * 看房提醒排程：由外部排程服務（例如 cron-job.org）每分鐘呼叫一次。
 * 需要帶 Authorization: Bearer <CRON_SECRET>，避免被別人亂呼叫。
 * Vercel 免費方案的內建排程每天只能跑一次，所以用外部排程。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isPushConfigured()) return NextResponse.json({ error: '伺服器還沒設定推播金鑰（VAPID）' }, { status: 500 });

  const now = new Date();
  const repos = getRepositories();
  const viewings = await repos.listings.listUpcomingViewings(
    now.toISOString(),
    new Date(now.getTime() + MAX_OFFSET_MINUTES * 60 * 1000).toISOString(),
  );

  // 每個人的提醒設定只讀一次
  const offsetsByUid = new Map<string, number[]>();
  for (const uid of new Set(viewings.map((v) => v.ownerUid))) {
    offsetsByUid.set(uid, (await repos.notifications.getReminderOffsets(uid)) ?? DEFAULT_REMINDER_OFFSETS);
  }

  let sent = 0;
  for (const reminder of findDueReminders(viewings, (uid) => offsetsByUid.get(uid) ?? [], now)) {
    if (await repos.notifications.wasReminderSent(reminder.key)) continue;
    // 先記下來再送：就算這次執行太久被中斷，也不會下一分鐘重複送
    await repos.notifications.markReminderSent(reminder.key);
    const { viewing, offset } = reminder;
    const time = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(viewing.viewingAt));
    sent += await sendToUser(repos.notifications, viewing.ownerUid, {
      title: `看房提醒：${viewing.title || '預約的物件'}`,
      body: `${formatOffset(offset)}後去看房（${time}）${viewing.address ? `・${viewing.address}` : ''}`,
      url: `/listing/${viewing.listingId}`,
      tag: `viewing-${viewing.listingId}`,
    });
  }
  return NextResponse.json({ checked: viewings.length, sent });
}

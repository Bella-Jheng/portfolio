import type { UpcomingViewing } from './data/types';

/** 沒設定過時的預設：前 2 小時、前 30 分鐘 */
export const DEFAULT_REMINDER_OFFSETS = [120, 30];
/** 最多提前 7 天、最多 5 個提醒 */
export const MAX_OFFSET_MINUTES = 7 * 24 * 60;
export const MAX_OFFSETS = 5;
/** 排程停掉一陣子再恢復時，超過這麼久的提醒就不補送，免得一次跳出一堆過期通知 */
export const STALE_AFTER_MINUTES = 15;

const MINUTE = 60 * 1000;

/** 整理使用者送來的提醒設定：去重複、只留合理範圍、由大到小排 */
export function normalizeOffsets(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const offsets = [...new Set(value)]
    .filter((v): v is number => Number.isInteger(v) && v >= 1 && v <= MAX_OFFSET_MINUTES)
    .sort((a, b) => b - a);
  return offsets.length > MAX_OFFSETS ? null : offsets;
}

/** 「2 小時」「30 分鐘」「1 天 3 小時」 */
export function formatOffset(minutes: number): string {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return [days && `${days} 天`, hours && `${hours} 小時`, mins && `${mins} 分鐘`].filter(Boolean).join(' ');
}

export interface DueReminder {
  key: string;
  viewing: UpcomingViewing;
  offset: number;
}

/**
 * 找出現在該送的提醒：看房時間還沒到、提醒時間（看房時間減掉提前的分鐘）已經到了、
 * 而且沒有過期太久。key 包含看房時間，改了預約時間就會重新提醒。
 */
export function findDueReminders(
  viewings: UpcomingViewing[],
  offsetsFor: (uid: string) => number[],
  now: Date,
): DueReminder[] {
  const due: DueReminder[] = [];
  for (const viewing of viewings) {
    const viewingAt = new Date(viewing.viewingAt).getTime();
    if (viewingAt <= now.getTime()) continue;
    for (const offset of offsetsFor(viewing.ownerUid)) {
      const fireAt = viewingAt - offset * MINUTE;
      const late = now.getTime() - fireAt;
      if (late >= 0 && late <= STALE_AFTER_MINUTES * MINUTE) {
        due.push({ key: `${viewing.ownerUid}:${viewing.listingId}:${viewing.viewingAt}:${offset}`, viewing, offset });
      }
    }
  }
  return due;
}

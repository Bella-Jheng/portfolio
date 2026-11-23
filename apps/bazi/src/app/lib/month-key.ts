/** 台灣時間的年月 'YYYY-MM'：判斷「本月運勢」是不是這個月產生的 */
export function taipeiMonthKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit' }).format(date);
}

/**
 * 這份命盤的本月運勢是哪個月產生的。
 * 新命盤會記在 monthlyFortuneFor；舊命盤沒有這個欄位，本月運勢是排盤當下產生的，用建立時間判斷
 */
export function readingMonthKey(reading: { monthlyFortuneFor?: string; createdAt?: string }): string | null {
  if (reading.monthlyFortuneFor) return reading.monthlyFortuneFor;
  if (!reading.createdAt) return null;
  const created = new Date(reading.createdAt);
  return Number.isNaN(created.getTime()) ? null : taipeiMonthKey(created);
}

/** 本月運勢是不是已經過期（不是這個月產生的） */
export function isMonthlyFortuneStale(reading: { monthlyFortuneFor?: string; createdAt?: string }, now: Date = new Date()): boolean {
  const key = readingMonthKey(reading);
  return key !== null && key !== taipeiMonthKey(now);
}

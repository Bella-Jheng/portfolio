import { describe, expect, it } from 'vitest';
import { isMonthlyFortuneStale, readingMonthKey, taipeiMonthKey } from './month-key';

describe('本月運勢的月份判斷', () => {
  it('用台灣時間算年月（UTC 月底晚上已經是台灣的下個月）', () => {
    expect(taipeiMonthKey(new Date('2026-11-30T17:00:00Z'))).toBe('2026-12');
    expect(taipeiMonthKey(new Date('2026-11-30T15:00:00Z'))).toBe('2026-11');
  });

  it('新命盤看 monthlyFortuneFor，舊命盤看建立時間', () => {
    expect(readingMonthKey({ monthlyFortuneFor: '2026-12', createdAt: '2026-10-01T00:00:00Z' })).toBe('2026-12');
    expect(readingMonthKey({ createdAt: '2026-10-15T00:00:00Z' })).toBe('2026-10');
    expect(readingMonthKey({})).toBeNull();
  });

  it('不是這個月產生的就過期，沒有資料不算過期', () => {
    const now = new Date('2026-12-01T01:00:00Z');
    expect(isMonthlyFortuneStale({ monthlyFortuneFor: '2026-11' }, now)).toBe(true);
    expect(isMonthlyFortuneStale({ monthlyFortuneFor: '2026-12' }, now)).toBe(false);
    expect(isMonthlyFortuneStale({}, now)).toBe(false);
  });
});

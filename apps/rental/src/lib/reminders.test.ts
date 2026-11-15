import { describe, expect, it } from 'vitest';
import { findDueReminders, formatOffset, normalizeOffsets } from './reminders';

const viewing = (viewingAt: string, ownerUid = 'alice') => ({
  ownerUid,
  listingId: 'l1',
  title: '西屯套房',
  address: '台中市',
  viewingAt,
});

describe('看房提醒', () => {
  const offsets = () => [120, 30];

  it('時間到了才送：前 2 小時、前 30 分鐘各一次', () => {
    const v = viewing('2026-11-15T07:00:00.000Z');
    expect(findDueReminders([v], offsets, new Date('2026-11-15T04:59:00.000Z'))).toEqual([]);
    expect(findDueReminders([v], offsets, new Date('2026-11-15T05:00:00.000Z')).map((r) => r.offset)).toEqual([120]);
    expect(findDueReminders([v], offsets, new Date('2026-11-15T06:31:00.000Z')).map((r) => r.offset)).toEqual([30]);
  });

  it('排程晚了幾分鐘還是會送，超過 15 分鐘就不補送', () => {
    const v = viewing('2026-11-15T07:00:00.000Z');
    expect(findDueReminders([v], () => [30], new Date('2026-11-15T06:44:00.000Z'))).toHaveLength(1);
    expect(findDueReminders([v], () => [30], new Date('2026-11-15T06:46:00.000Z'))).toEqual([]);
  });

  it('看房時間已經過了就不送', () => {
    expect(findDueReminders([viewing('2026-11-15T07:00:00.000Z')], () => [5], new Date('2026-11-15T07:01:00.000Z'))).toEqual([]);
  });

  it('改了預約時間會產生新的提醒 key', () => {
    const a = findDueReminders([viewing('2026-11-15T07:00:00.000Z')], () => [30], new Date('2026-11-15T06:30:00.000Z'));
    const b = findDueReminders([viewing('2026-11-15T08:00:00.000Z')], () => [30], new Date('2026-11-15T07:30:00.000Z'));
    expect(a[0].key).not.toBe(b[0].key);
  });

  it('每個人用自己的提醒設定', () => {
    const now = new Date('2026-11-15T06:00:00.000Z');
    const due = findDueReminders(
      [viewing('2026-11-15T07:00:00.000Z', 'alice'), viewing('2026-11-15T07:00:00.000Z', 'bob')],
      (uid) => (uid === 'alice' ? [60] : [30]),
      now,
    );
    expect(due.map((r) => r.viewing.ownerUid)).toEqual(['alice']);
  });

  it('整理提醒設定：去重複、排序、擋掉不合理的值', () => {
    expect(normalizeOffsets([30, 120, 30])).toEqual([120, 30]);
    expect(normalizeOffsets([0, -5, 1.5, 99999, 15])).toEqual([15]);
    expect(normalizeOffsets([1, 2, 3, 4, 5, 6])).toBeNull();
    expect(normalizeOffsets('30')).toBeNull();
  });

  it('提前時間的文字', () => {
    expect(formatOffset(30)).toBe('30 分鐘');
    expect(formatOffset(120)).toBe('2 小時');
    expect(formatOffset(1590)).toBe('1 天 2 小時 30 分鐘');
  });
});

import { describe, expect, it } from 'vitest';
import { dailyQuestionLimit, demoDay, demoReadingId, isDemoReadingId } from './demo-config';
import { fallbackDemoReading, fromTemplate } from './demo-reading';

describe('訪客 Demo', () => {
  it('範例命盤的 id 跟正式命盤（uuid）分得開', () => {
    expect(isDemoReadingId(demoReadingId('abc'))).toBe(true);
    expect(isDemoReadingId('3f2b8c1e-1234-4abc-9def-0123456789ab')).toBe(false);
    expect(dailyQuestionLimit(demoReadingId('abc'))).toBe(2);
    expect(dailyQuestionLimit('3f2b8c1e-1234-4abc-9def-0123456789ab')).toBe(3);
  });

  it('內建範例的四柱由計算器算出，格局那行解析得出來', () => {
    const reading = fallbackDemoReading() as { pillars: { day: { stem: string } }; fortune: { tenGodAnalysis: string } };
    expect(reading.pillars.day.stem).toBe('戊');
    const firstLine = reading.fortune.tenGodAnalysis.split('\n')[0];
    expect(firstLine).toMatch(/【格局】[^｜]+｜身弱｜用神：/);
  });

  it('從範本複製時不帶提問、建立者，名字換成範例名', () => {
    const copied = fromTemplate({ name: '真人', createdBy: 'u1', questions: [{ q: 1 }], fortune: { career: 'x' }, birthYear: 2000 });
    expect(copied).toEqual({ name: '體驗小貓', fortune: { career: 'x' }, birthYear: 2000 });
  });

  it('台灣時間換日', () => {
    expect(demoDay(new Date('2026-11-21T16:00:00Z'))).toBe('2026-11-22');
  });
});

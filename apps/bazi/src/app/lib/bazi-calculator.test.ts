import { describe, it, expect } from 'vitest';
import {
  calculateBaziPillars,
  getDayMasterElement,
  findStrongElementYears,
  recalibrateDayMasterStrength,
  defaultDayMasterStrength,
} from './bazi-calculator';
import type { BaziPillars } from '../types/bazi';

describe('calculateBaziPillars', () => {
  it('1996/03/08 23:08 → 丙子 / 辛卯 / 乙巳 / 丙子', () => {
    const pillars = calculateBaziPillars(1996, 3, 8, 23);

    expect(`${pillars.year.stem}${pillars.year.branch}`).toBe('丙子');
    expect(`${pillars.month.stem}${pillars.month.branch}`).toBe('辛卯');
    expect(`${pillars.day.stem}${pillars.day.branch}`).toBe('乙巳');
    expect(`${pillars.hour?.stem}${pillars.hour?.branch}`).toBe('丙子');
  });
});

function makePillars(dayStem: string): BaziPillars {
  return {
    year: { stem: '甲', branch: '子', element: '木/水' },
    month: { stem: '甲', branch: '子', element: '木/水' },
    day: { stem: dayStem, branch: '子', element: '木/水' },
  };
}

describe('getDayMasterElement', () => {
  it('reads the day stem element (乙 → 木)', () => {
    expect(getDayMasterElement(makePillars('乙'))).toBe('木');
  });
});

describe('findStrongElementYears', () => {
  it('ranks stem+branch double matches above branch-only matches, most recent first, capped at 5', () => {
    const years = findStrongElementYears(makePillars('甲'), 1996, 2036);
    expect(years.map((y) => y.year)).toEqual([2035, 2034, 2023, 2022, 2011]);
    expect(years.find((y) => y.year === 2035)?.isDoubleMatch).toBe(true);
    expect(years.find((y) => y.year === 2034)?.isDoubleMatch).toBe(true);
    expect(years.find((y) => y.year === 2023)?.isDoubleMatch).toBe(false);
  });

  it('returns an empty list when no year in range has a branch matching the day master element', () => {
    const years = findStrongElementYears(makePillars('甲'), 1997, 1997);
    expect(years).toEqual([]);
  });
});

describe('recalibrateDayMasterStrength', () => {
  it('keeps the original verdict when there are no answers', () => {
    expect(recalibrateDayMasterStrength('身弱', [])).toBe('身弱');
  });

  it('keeps the original verdict on a tie', () => {
    expect(recalibrateDayMasterStrength('身強', [
      { year: 2020, feeling: 'good' },
      { year: 2021, feeling: 'bad' },
    ])).toBe('身強');
  });

  it('nudges toward 從強 when most years felt bad (element is a burden)', () => {
    expect(recalibrateDayMasterStrength('身弱', [
      { year: 2020, feeling: 'bad' },
      { year: 2021, feeling: 'bad' },
      { year: 2022, feeling: 'good' },
    ])).toBe('身強');
  });

  it('nudges toward 從弱 when most years felt good (element is helpful)', () => {
    expect(recalibrateDayMasterStrength('身強', [
      { year: 2020, feeling: 'good' },
      { year: 2021, feeling: 'good' },
    ])).toBe('身弱');
  });

  it('clamps at the 從強 boundary instead of overshooting', () => {
    expect(recalibrateDayMasterStrength('從強', [{ year: 2020, feeling: 'bad' }])).toBe('從強');
  });

  it('clamps at the 從弱 boundary instead of overshooting', () => {
    expect(recalibrateDayMasterStrength('從弱', [{ year: 2020, feeling: 'good' }])).toBe('從弱');
  });
});

describe('defaultDayMasterStrength', () => {
  it('falls back from 從強 to 身強 when the user gave no calibration answers', () => {
    expect(defaultDayMasterStrength('從強')).toBe('身強');
  });

  it('falls back from 從弱 to 身弱 when the user gave no calibration answers', () => {
    expect(defaultDayMasterStrength('從弱')).toBe('身弱');
  });

  it('leaves 身強/身弱 unchanged since they are already the moderate verdicts', () => {
    expect(defaultDayMasterStrength('身強')).toBe('身強');
    expect(defaultDayMasterStrength('身弱')).toBe('身弱');
  });
});

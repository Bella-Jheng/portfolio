import { describe, it, expect } from 'vitest';
import { calculateBaziPillars } from './bazi-calculator';

describe('calculateBaziPillars', () => {
  it('1996/03/08 23:08 → 丙子 / 辛卯 / 乙巳 / 丙子', () => {
    const pillars = calculateBaziPillars(1996, 3, 8, 23);

    expect(`${pillars.year.stem}${pillars.year.branch}`).toBe('丙子');
    expect(`${pillars.month.stem}${pillars.month.branch}`).toBe('辛卯');
    expect(`${pillars.day.stem}${pillars.day.branch}`).toBe('乙巳');
    expect(`${pillars.hour?.stem}${pillars.hour?.branch}`).toBe('丙子');
  });
});

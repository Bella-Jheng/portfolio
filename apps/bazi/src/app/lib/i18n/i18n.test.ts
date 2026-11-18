import { describe, it, expect } from 'vitest';
import { MESSAGES, translate, localizeError } from './messages';
import { localeFromAcceptLanguage } from './locale';
import { patternLabel, stemEn, strengthLabel, tenGodLabel } from './glossary';

describe('i18n 字典', () => {
  it('英文字典的 key 和中文完全一樣，而且沒有空字串', () => {
    expect(Object.keys(MESSAGES.en).sort()).toEqual(Object.keys(MESSAGES.zh).sort());
    for (const value of Object.values(MESSAGES.en)) expect(value.trim()).not.toBe('');
  });

  it('插值會代入變數，缺的變數保留原樣', () => {
    expect(translate('zh', 'qa.remaining', { n: 2 })).toBe('今日剩餘 2/3 題');
    expect(translate('en', 'qa.remaining', { n: 2 })).toBe('2 of 3 left today');
    expect(translate('en', 'qa.remaining')).toBe('{n} of 3 left today');
  });

  it('伺服器的中文錯誤訊息在英文介面會對照成英文，對照不到就原樣顯示', () => {
    expect(localizeError('請先登入', 'en')).toBe('Please sign in first');
    expect(localizeError('請先登入', 'zh')).toBe('請先登入');
    expect(localizeError('未知錯誤', 'en')).toBe('未知錯誤');
  });
});

describe('瀏覽器語言判斷', () => {
  it('中文系瀏覽器用中文，其他語言用英文，沒有資訊時預設中文', () => {
    expect(localeFromAcceptLanguage('zh-TW,zh;q=0.9,en;q=0.8')).toBe('zh');
    expect(localeFromAcceptLanguage('zh-CN')).toBe('zh');
    expect(localeFromAcceptLanguage('en-US,en;q=0.9')).toBe('en');
    expect(localeFromAcceptLanguage('ja-JP')).toBe('en');
    expect(localeFromAcceptLanguage(null)).toBe('zh');
  });
});

describe('命理術語對照', () => {
  it('天干、十神、身強弱、格局都有英文', () => {
    expect(stemEn('丁')).toBe('Yin Fire');
    expect(tenGodLabel('正財', 'en')).toBe('Direct Wealth');
    expect(tenGodLabel('正財', 'zh')).toBe('正財');
    expect(strengthLabel('身強', 'en')).toBe('Strong');
    expect(patternLabel('正財格', 'en')).toBe('Direct Wealth');
    expect(patternLabel('食神生財格（身強）', 'en')).toBe('Eating God');
  });
});

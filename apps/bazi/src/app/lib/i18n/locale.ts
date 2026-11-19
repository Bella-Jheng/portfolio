// 介面語言：中文是主版本（AI 分析一律先用中文產生），英文是翻譯版
export type Locale = 'zh' | 'en';

export const LOCALES: Locale[] = ['zh', 'en'];
export const DEFAULT_LOCALE: Locale = 'zh';

// 存在 cookie，伺服器端 layout 也讀得到，第一次渲染就是正確語言，不會閃一下中文再變英文
export const LOCALE_COOKIE = 'bazi_locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'zh' || value === 'en';
}

// 沒有 cookie 時依瀏覽器語言判斷：中文系一律用中文，其他語言用英文
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(',')[0]?.trim().toLowerCase() ?? '';
  if (!first) return DEFAULT_LOCALE;
  return first.startsWith('zh') ? 'zh' : 'en';
}

export const HTML_LANG: Record<Locale, string> = { zh: 'zh-TW', en: 'en' };

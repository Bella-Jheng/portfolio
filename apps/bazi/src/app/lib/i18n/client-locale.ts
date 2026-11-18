import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './locale';

/** 給 React 元件以外的地方（store、工具函式）讀目前語言；元件內請用 useLocale() */
export function getClientLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

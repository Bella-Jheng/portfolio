'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HTML_LANG, LOCALE_COOKIE, type Locale } from './locale';
import { translate, type MessageKey, type MessageVars } from './messages';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: MessageVars) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // 切換語言：存進 cookie（下次打開直接用這個語言，伺服器第一次渲染也讀得到），同步 <html lang>
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}

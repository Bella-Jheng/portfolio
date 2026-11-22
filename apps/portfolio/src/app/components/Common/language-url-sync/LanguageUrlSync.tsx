'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguageStore } from '../../../store/language.store';

export function LanguageUrlSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguageStore();
  const adoptedUrlLang = useRef(false);

  useEffect(() => {
    if (!adoptedUrlLang.current) {
      adoptedUrlLang.current = true;
      const urlLang = searchParams.get('lang');
      if ((urlLang === 'zh' || urlLang === 'en') && urlLang !== language) {
        setLanguage(urlLang);
        return;
      }
    }

    if (searchParams.get('lang') !== language) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('lang', language);
      // 用瀏覽器原生的 replaceState 改網址（Next.js 會同步 useSearchParams），
      // 不用 router.replace：它每次換頁後都會再跟伺服器要一次頁面資料，多等一輪
      window.history.replaceState(window.history.state, '', `${pathname}?${params.toString()}`);
    }
  }, [language, pathname, searchParams, setLanguage]);

  return null;
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLanguageStore } from '../../../store/language.store';

export function LanguageUrlSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
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
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [language, pathname, searchParams, router, setLanguage]);

  return null;
}

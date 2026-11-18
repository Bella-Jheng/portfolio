'use client';

import { useLocale } from '../../../lib/i18n/locale-context';

/** 中 / EN 切換：整顆是一個按鈕（觸控範圍 44px），膠囊裡用深色底標出目前的語言 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const next = locale === 'zh' ? 'en' : 'zh';

  const segment = (active: boolean) =>
    `min-w-[30px] h-[26px] px-2 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
      active ? 'bg-bz-brown text-[#FFFDF5]' : 'text-bz-mid'
    }`;

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={t('lang.switchTo')}
      className="h-11 px-0.5 flex items-center focus:outline-none"
    >
      <span className="flex items-center p-[3px] border border-bz-border rounded-full bg-white/75">
        <span className={segment(locale === 'zh')}>{t('lang.zh')}</span>
        <span className={`${segment(locale === 'en')} tracking-wide`}>{t('lang.en')}</span>
      </span>
    </button>
  );
}

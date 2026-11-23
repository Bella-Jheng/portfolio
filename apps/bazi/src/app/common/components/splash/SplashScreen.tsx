'use client';

import { useEffect, useState } from 'react';
import { SPLASH_SEEN_KEY } from '../../../lib/splash';
import { useOnboardingStore } from '../../../lib/onboarding-store';
import { useLocale } from '../../../lib/i18n/locale-context';

const SHOW_MS = 1600;
const FADE_MS = 450;

const STAR = 'M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z';

/**
 * 開場動畫：米白底、黃色色塊浮出、橘貓彈進來、星星閃爍、「命格貓」淡入，約 1.6 秒後淡出。
 * 每次打開 App 播一次；同一個分頁換頁不再播（layout 的 inline script 會在畫面出現前藏起來）。
 * 播完通知介紹畫面可以出場了。
 */
export function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const markSplashDone = useOnboardingStore((s) => s.markSplashDone);
  const { locale, t } = useLocale();

  useEffect(() => {
    if (document.documentElement.dataset.splash === 'seen') {
      setGone(true);
      markSplashDone();
      return;
    }
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      /* 無痕模式存不了就每次都播 */
    }
    const leave = setTimeout(() => setLeaving(true), SHOW_MS);
    const remove = setTimeout(() => {
      setGone(true);
      markSplashDone();
    }, SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [markSplashDone]);

  if (gone) return null;

  return (
    <div
      id="bazi-splash"
      role="status"
      aria-label={t('splash.name')}
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#FFFDF5] ${leaving ? 'bz-splash-out' : ''}`}
    >
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div
          aria-hidden
          className="bz-splash-blob absolute w-48 h-48 bg-[#FCD060]/50"
          style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
        />
        {[
          { cls: 'top-2 right-4 w-6 h-6', delay: '0.5s', color: '#FCD060' },
          { cls: 'bottom-6 left-2 w-5 h-5', delay: '0.75s', color: '#FFE8B6' },
          { cls: 'top-10 left-0 w-4 h-4', delay: '0.95s', color: '#FCD060' },
        ].map((s) => (
          <svg key={s.cls} aria-hidden viewBox="0 0 24 24" fill={s.color} className={`bz-splash-star absolute ${s.cls}`} style={{ animationDelay: s.delay }}>
            <path d={STAR} />
          </svg>
        ))}
        <img src="/cats/bazi-cat-default.webp" alt="" width={150} height={150} className="bz-splash-cat relative w-[150px] h-[150px] object-contain" />
      </div>
      <p className={`bz-splash-title mt-4 text-2xl font-black text-[#2D2420] ${locale === 'zh' ? 'tracking-[0.3em]' : 'tracking-wide'}`}>{t('splash.name')}</p>
      <div aria-hidden className="mt-5 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="bz-splash-dot w-1.5 h-1.5 rounded-full bg-[#E9B93A]" style={{ animationDelay: `${0.9 + i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

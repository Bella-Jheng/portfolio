'use client';

import { useEffect, useState } from 'react';
import { BlueFlower, BlackFlower, RedFlower } from '@/public/img';
import { useLoadingStore } from '../../../store/loading.store';
import { SPLASH_SEEN_KEY } from './splash-key';

// 開場停留時間：三朵花綻放 → 名字浮上來 → 小點跳一下，再淡出
const MIN_SHOW_MS = 1800;
const FADE_OUT_MS = 450; // 要跟 animate-splash-out 的時間一致

const FLOWERS = [
  { src: BlueFlower.src, delay: '0s' },
  { src: BlackFlower.src, delay: '0.18s' },
  { src: RedFlower.src, delay: '0.36s' },
];

/**
 * 開場畫面（參考租屋小幫手）：每次打開網站、同一個分頁只出現一次。
 * 伺服器就先畫出來，所以一打開就看得到；看過的分頁由 layout 的 inline script
 * 在畫面出現前標記 html[data-splash='seen']，CSS 直接藏起來，不會閃一下。
 */
export function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const setInitialLoadingShown = useLoadingStore.use.setInitialLoadingShown();

  useEffect(() => {
    if (document.documentElement.dataset.splash === 'seen') {
      setGone(true);
      setInitialLoadingShown();
      return;
    }
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      /* 無痕模式之類存不了，就每次都顯示 */
    }
    const leave = setTimeout(() => {
      setLeaving(true);
      // 開場開始淡出時，首頁的花朵進場動畫同時開始
      setInitialLoadingShown();
    }, MIN_SHOW_MS);
    const remove = setTimeout(() => setGone(true), MIN_SHOW_MS + FADE_OUT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [setInitialLoadingShown]);

  if (gone) return null;

  return (
    <div
      id="splash"
      role="status"
      aria-label="I'm Yiting - Portfolio 載入中"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F1F2CA] ${
        leaving ? 'animate-splash-out pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-4 md:gap-5" aria-hidden="true">
        {FLOWERS.map(({ src, delay }) => (
          <img
            key={src}
            src={src}
            alt=""
            className="w-14 h-14 md:w-16 md:h-16 animate-flower-bloom"
            style={{ animationDelay: delay }}
          />
        ))}
      </div>

      <p
        className="mt-7 text-3xl md:text-4xl font-black tracking-wider text-txt-brown animate-splash-fade-up"
        style={{ animationDelay: '0.6s' }}
      >
        鄭伊婷
      </p>
      <p
        className="mt-2 text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-txt-darkBrown/60 animate-splash-fade-up"
        style={{ animationDelay: '0.75s' }}
      >
        Yiting · Front-End Engineer
      </p>

      <div
        className="mt-8 flex gap-2 animate-splash-fade-up"
        style={{ animationDelay: '0.9s' }}
        aria-hidden="true"
      >
        {[0, 0.15, 0.3].map((d) => (
          <span
            key={d}
            className="h-2 w-2 rounded-full bg-txt-darkBrown/70 animate-splash-dot"
            style={{ animationDelay: `${0.9 + d}s` }}
          />
        ))}
      </div>
    </div>
  );
}

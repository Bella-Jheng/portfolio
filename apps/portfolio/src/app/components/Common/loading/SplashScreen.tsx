'use client';

import { useEffect, useState } from 'react';
import { RedFlower } from '@/public/img';
import { useLoadingStore } from '../../../store/loading.store';
import { SPLASH_SEEN_KEY } from './splash-key';

// 開場停留時間：「你好 → Hello → สวัสดี」輪流出現，最後停在歡迎詞，再淡出
const MIN_SHOW_MS = 2200;
const FADE_OUT_MS = 450; // 要跟 animate-splash-out 的時間一致

// 前兩個問候翻上來再翻出去，最後一個（泰文）留下來
const GREETINGS = [
  { text: '你好', delay: '0s', stay: false },
  { text: 'Hello', delay: '0.55s', stay: false },
  { text: 'สวัสดี', delay: '1.1s', stay: true },
];

/**
 * 開場畫面：一朵紅花在轉，下面用中文、英文、泰文輪流打招呼，再停在歡迎詞。
 * 每次打開網站、同一個分頁只出現一次（參考租屋小幫手）。
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
      aria-label="歡迎光臨 伊婷的作品集"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-center bg-[#F1F2CA] ${
        leaving ? 'animate-splash-out pointer-events-none' : ''
      }`}
    >
      <img
        src={RedFlower.src}
        alt=""
        aria-hidden="true"
        className="w-10 h-10 md:w-12 md:h-12 animate-flower-spin"
      />

      {/* 三個問候疊在同一個位置輪流出現；整段動畫用 CSS 跑，不用等 JS 載入 */}
      <div className="relative mt-6 h-14 w-full" aria-hidden="true">
        {GREETINGS.map(({ text, delay, stay }) => (
          <p
            key={text}
            className={`absolute inset-0 text-4xl md:text-5xl font-black text-txt-brown ${
              stay ? 'animate-splash-fade-up' : 'animate-greet-flip'
            }`}
            style={{ animationDelay: delay }}
          >
            {text}
          </p>
        ))}
      </div>

      <p
        className="mt-5 text-base md:text-lg font-bold tracking-[0.15em] text-txt-brown animate-splash-fade-up"
        style={{ animationDelay: '1.35s' }}
      >
        歡迎光臨　伊婷的作品集
      </p>
      <p
        className="mt-2 text-xs font-bold tracking-[0.25em] text-[#8B9467] animate-splash-fade-up"
        style={{ animationDelay: '1.5s' }}
      >
        ZH · EN · TH
      </p>
    </div>
  );
}

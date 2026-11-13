'use client';

import { useEffect, useState } from 'react';
import { SPLASH_SEEN_KEY } from '../lib/splash';
const MIN_SHOW_MS = 1400;

/**
 * 開場畫面：每次打開網站（同一個分頁只出現一次）顯示胡桃木色底、中間一棟房子，
 * 屋頂線條畫出來、窗戶亮起，下面三個小點跳動，然後淡出。
 * 伺服器先畫出來，看過的分頁由 layout.tsx 的 inline script 在畫面出現前藏起來，所以不會閃一下。
 */
export function SplashScreen() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.splash === 'seen') {
      setGone(true);
      return;
    }
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      /* 無痕模式之類的存不了，就每次都顯示 */
    }
    const leave = setTimeout(() => setLeaving(true), MIN_SHOW_MS);
    const remove = setTimeout(() => setGone(true), MIN_SHOW_MS + 400);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      id="splash"
      role="status"
      aria-label="租屋小幫手載入中"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-brand ${
        leaving ? 'animate-splash-out' : ''
      }`}
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        {/* 屋頂和牆：用線條「畫」出來 */}
        <path
          d="M18 58 60 22l42 36"
          pathLength={100}
          stroke="#F3EDE6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          className="animate-draw-line"
        />
        <path
          d="M30 50v46h60V50"
          pathLength={100}
          stroke="#F3EDE6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          className="animate-draw-line"
          style={{ animationDelay: '0.35s' }}
        />
        {/* 門 */}
        <rect
          x="52"
          y="70"
          width="16"
          height="26"
          rx="3"
          fill="#F3EDE6"
          className="animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        />
        {/* 窗戶：檯燈的暖光，一閃一閃 */}
        <rect x="38" y="58" width="10" height="10" rx="2" fill="#F3D29B" className="animate-window-glow" />
        <rect x="72" y="58" width="10" height="10" rx="2" fill="#F3D29B" className="animate-window-glow" style={{ animationDelay: '0.4s' }} />
      </svg>
      <p className="animate-fade-up text-lg font-bold tracking-wider text-[#F3EDE6]" style={{ animationDelay: '0.5s' }}>
        租屋小幫手
      </p>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-dot-bounce rounded-full bg-[#F3D29B]"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

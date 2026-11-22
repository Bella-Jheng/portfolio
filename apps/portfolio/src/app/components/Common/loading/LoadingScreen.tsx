'use client';

import React from 'react';
import { BlueFlower, BlackFlower, RedFlower } from '@/public/img';

interface LoadingScreenProps {
  className?: string;
}

const FLOWERS = [
  { src: BlueFlower.src, delay: '0s' },
  { src: BlackFlower.src, delay: '0.15s' },
  { src: RedFlower.src, delay: '0.3s' },
];

// 「• • • LOADING • • •」兩側的小點：由外往內依序閃（右側左右對稱）
const DOT_DELAYS_LEFT = ['0s', '0.15s', '0.3s'];
const DOT_DELAYS_RIGHT = ['0.3s', '0.15s', '0s'];

const Dot = ({ delay }: { delay: string }) => (
  <span
    className="w-1.5 h-1.5 rounded-full bg-gray-400 mb-1.5 animate-pulse"
    style={{ animationDelay: delay }}
  />
);

/**
 * 打 API 時的 loading：三朵花輪流跳，下面是「• • • LOADING • • •」。
 * （第一次打開網站的完整開場畫面在 SplashScreen）
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#FBFAF1] ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {FLOWERS.map(({ src, delay }) => (
          <img
            key={src}
            src={src}
            alt=""
            className="w-9 h-9 md:w-12 md:h-12 animate-flower-hop"
            style={{ animationDelay: delay }}
          />
        ))}
      </div>

      <div className="flex items-end gap-1" aria-hidden="true">
        {DOT_DELAYS_LEFT.map((d) => (
          <Dot key={`l${d}`} delay={d} />
        ))}
        <span className="text-base md:text-lg font-bold text-gray-500 mx-2 tracking-widest uppercase">
          Loading
        </span>
        {DOT_DELAYS_RIGHT.map((d) => (
          <Dot key={`r${d}`} delay={d} />
        ))}
      </div>
    </div>
  );
};

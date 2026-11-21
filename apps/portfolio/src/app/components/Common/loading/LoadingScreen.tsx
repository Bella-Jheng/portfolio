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

/**
 * 打 API 時的 loading：只有三朵花輪流跳，沒有文字。
 * （第一次打開網站的完整開場畫面在 SplashScreen）
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#FBFAF1] ${className}`}
    >
      <div className="flex items-center gap-3">
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
    </div>
  );
};

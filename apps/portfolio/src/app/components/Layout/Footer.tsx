'use client';
import React from 'react';
import { RedFlower } from '@/public/img';

export const Footer: React.FC = () => {
  return (
    // 手機版底部多留出懸浮導覽列（BottomNav）的高度，避免內容被蓋住
    <footer className="bg-[#A6C98A] pt-10 pb-[calc(var(--nav-h)+1.5rem)] md:py-12 px-6 text-center text-white flex flex-col items-center space-y-4">
      <p className="text-lg font-bold flex items-center justify-center gap-4">
        <img src={RedFlower.src} alt="Red Flower" className="w-6 h-6" />
        Contact Me
        <img src={RedFlower.src} alt="Red Flower" className="w-6 h-6" />
      </p>
      <div className="space-y-1">
        <a href="mailto:bz850308@gmail.com" className="block text-md font-medium">
          bz850308@gmail.com
        </a>
        <p className="text-md font-medium">design/make website</p>
        <p className="text-sm opacity-90 mt-2">© 2026</p>
      </div>
    </footer>
  );
};

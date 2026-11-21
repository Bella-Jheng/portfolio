'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RedFlower } from '@/public/img';
import { useLanguageStore } from '../../store/language.store';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const isEn = language === 'en';

  // 與手機版 Header menu 相同的連結（menu 仍保留）
  const navItems = [
    { href: '/', label: isEn ? 'Home' : '首頁', active: pathname === '/' },
    {
      href: '/resume',
      label: isEn ? 'Resume' : '履歷',
      active: pathname === '/resume',
    },
    {
      href: '/projects',
      label: isEn ? 'Projects' : '作品',
      active: pathname.startsWith('/projects'),
    },
  ];

  return (
    <footer className="bg-[#A6C98A] py-12 px-6 text-center text-white flex flex-col items-center space-y-4">
      {/* Mobile footer nav */}
      <nav
        aria-label={isEn ? 'Footer navigation' : '頁尾導覽'}
        className="sm:hidden flex items-center justify-center gap-3 pb-6 mb-2 w-full max-w-xs border-b border-white/40 font-bold tracking-wider"
      >
        {navItems.map((item, idx) => (
          <React.Fragment key={item.href}>
            {idx > 0 && <span className="text-white/60">|</span>}
            <Link
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={`px-2 py-1 ${item.active ? 'text-txt-darkBrown' : 'text-white'}`}
            >
              {item.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <p className="text-lg font-bold flex items-center justify-center gap-4">
        <img src={RedFlower.src} alt="Red Flower" className="w-6 h-6" />
        Contact Me
        <img src={RedFlower.src} alt="Red Flower" className="w-6 h-6" />
      </p>
      <div className="space-y-1">
        <p className="text-md font-medium">bz850308@gmail.com</p>
        <p className="text-md font-medium">design/make website</p>
        <p className="text-sm opacity-90 mt-2">© 2026</p>
      </div>
    </footer>
  );
};

'use client';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from '@/public/icon';
import { useLanguageStore } from '../../store/language.store';

export const Header: React.FC = () => {
  const [scrollBgColor, setScrollBgColor] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const pathname = usePathname();

  const isEn = language === 'en';

  // 手機版：作品詳細頁顯示「返回」，像 App 一樣回到上一頁
  const isDetailPage = /^\/projects\/[^/]+/.test(pathname);
  const navCount = useRef(0);
  useEffect(() => {
    navCount.current += 1;
  }, [pathname]);
  const goBack = () => {
    // 站內有上一頁才 back，直接從外部連結進來就回作品集
    if (navCount.current > 1) router.back();
    else router.push('/projects');
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mapping paths to background colors
  const bgColorMap: Record<string, string> = {
    '/pages': 'bg-[#F1F2CA]',
    '/pages/resume': 'bg-[#F1F2CA]',
    '/pages/projects': 'bg-[#F1F2CA]',
  };

  const defaultBgColor = bgColorMap[pathname] || 'bg-[#F1F2CA]';
  const currentBgColor =
    pathname === '/' && scrollBgColor ? scrollBgColor : defaultBgColor;

  useEffect(() => {
    if (pathname !== '/') {
      setScrollBgColor('');
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeDistance = 600;
      const progress = Math.min(1, Math.max(0, scrollY / fadeDistance));

      // Interpolate from #F1F2CA (241, 242, 202) to #FBFAF1 (251, 250, 241)
      const red = Math.round(241 + (251 - 241) * progress);
      const green = Math.round(242 + (250 - 242) * progress);
      const blue = Math.round(202 + (241 - 202) * progress);

      setScrollBgColor(`rgb(${red}, ${green}, ${blue})`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const SwitchComponent = () => (
    <div
      className="inline-flex flex-shrink-0 items-center rounded-full p-1 gap-1 bg-[#E3E4C1] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-[#d2d3ad]"
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLanguage('zh')}
        aria-pressed={!isEn}
        className={`px-3 h-6 rounded-full text-[13px] font-bold transition-colors duration-300 focus:outline-none ${!isEn ? 'bg-txt-darkBrown text-[#FBFAF1]' : 'text-[#a3a579] hover:text-txt-brown'}`}
      >
        中
      </button>
      <button
        onClick={() => setLanguage('en')}
        aria-pressed={isEn}
        className={`px-3 h-6 rounded-full text-[13px] font-bold transition-colors duration-300 focus:outline-none ${isEn ? 'bg-txt-darkBrown text-[#FBFAF1]' : 'text-[#a3a579] hover:text-txt-brown'}`}
      >
        EN
      </button>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 w-full font-sans z-[50]`}
      style={{ backgroundColor: pathname === '/' ? currentBgColor : undefined }} // Use inline style for precise RGB control on Home
    >
      <div
        className={`absolute inset-0 -z-10 transition-colors duration-500 ${defaultBgColor} ${pathname === '/' ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Mobile App Bar */}
      <div
        className={`md:hidden flex items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] transition-shadow duration-300 ${isScrolled ? 'shadow-[0_1px_0_rgba(45,27,27,0.08)]' : ''}`}
      >
        <div className="flex items-center h-[var(--appbar-h)] min-w-0">
          {isDetailPage ? (
            <button
              onClick={goBack}
              className="-ml-2 flex items-center gap-0.5 pr-3 py-2 text-txt-darkBrown font-bold active:opacity-60 transition-opacity"
              aria-label={isEn ? 'Back' : '返回'}
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-md">{isEn ? 'Projects' : '作品集'}</span>
            </button>
          ) : (
            <Link href="/" className="text-lg font-black text-txt-brown leading-none truncate">
              {isEn ? "I'm Yiting." : '我是 鄭伊婷'}
            </Link>
          )}
        </div>
        <SwitchComponent />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center py-6 px-10 max-w-full mx-auto w-full transition-all">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-txt-brown leading-none">
            {isEn ? "I'm Yiting." : '我是 鄭伊婷'}
          </h1>
          <p className="text-md text-gray-700 mt-1">
            {isEn
              ? 'A Front-End Software Engineer, good at communication.'
              : '樂於溝通、理解用戶的前端工程師'}
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex text-md font-medium items-center space-x-5">
          <Link
            href="/"
            className={`${pathname === '/'
              ? 'text-txt-red font-bold'
              : 'text-gray-700 hover:text-txt-brown'
              }`}
          >
            {isEn ? 'Home' : '首頁'}
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/resume"
            className={`${pathname === '/resume'
              ? 'text-txt-red font-bold'
              : 'text-gray-700 hover:text-txt-brown'
              }`}
          >
            {isEn ? 'Resume' : '履歷'}
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/projects"
            className={`${pathname.startsWith('/projects')
              ? 'text-txt-red font-bold'
              : 'text-gray-700 hover:text-txt-brown'
              }`}
          >
            {isEn ? 'Projects' : '作品'}
          </Link>
          <div className="pl-3 border-l-[1.5px] border-gray-300 flex items-center h-5">
            <SwitchComponent />
          </div>
        </nav>
      </div>
    </header>
  );
};

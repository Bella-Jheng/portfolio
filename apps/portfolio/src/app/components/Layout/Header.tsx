'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Close } from '@/public/icon';
import { BlackFlower, RedFlower, BlueFlower } from '@/public/img';
import { useLanguageStore } from '../../store/language.store';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollBgColor, setScrollBgColor] = useState('');
  const { language, setLanguage } = useLanguageStore();
  const pathname = usePathname();

  const isEn = language === 'en';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

      {/* Main Header Container */}
      <div
        className={`flex justify-between items-center h-[50px] md:h-auto md:py-6 py-10 px-4 md:px-10 max-w-full mx-auto w-full transition-all`}
      >
        {/* Mobile Header Box (Rounded corners and border) */}
        <div className="flex-1 md:flex-none flex justify-between items-center sm:block border-[2px] border-txt-darkBrown rounded-xl p-2 md:p-0 sm:border-none md:bg-transparent">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-txt-brown leading-none">
              {isEn ? "I'm Yiting." : '我是 鄭伊婷'}
            </h1>
            <p className="hidden md:block text-md text-gray-700 mt-1">
              {isEn
                ? 'A Front-End Software Engineer, good at communication.'
                : '樂於溝通、理解用戶的前端工程師'}
            </p>
          </div>

          {/* Mobile Actions: Switch & Hamburger */}
          <div className="flex items-center space-x-4 sm:hidden">
            <SwitchComponent />
            <button
              onClick={toggleMenu}
              className="flex flex-col justify-between w-6 h-4 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <span className="block h-1 w-full bg-txt-darkBrown rounded-full"></span>
              <span className="block h-1 w-full bg-txt-darkBrown rounded-full"></span>
              <span className="block h-1 w-full bg-txt-darkBrown rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex text-md font-medium items-center space-x-5">
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#FBF9E1] flex flex-col p-8 transition-transform duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Menu Header */}
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-xl font-bold text-txt-brown">
            {isEn ? "I'm Yiting." : '我是 鄭伊婷'}
          </h1>
          <button
            onClick={toggleMenu}
            className="text-txt-brown focus:outline-none"
            aria-label="Close Menu"
          >
            <Close className="w-10 h-10" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col space-y-10">
          <div className="flex flex-col">
            <Link
              href="/"
              className={`flex items-center text-xl font-black tracking-wider mb-2 ${pathname === '/' ? 'text-txt-red' : 'text-txt-brown'
                }`}
              onClick={toggleMenu}
            >
              <img src={BlackFlower.src} alt="" className="w-8 h-8 mr-4" />{' '}
              {isEn ? 'HOME' : '首頁'}
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/resume"
              className={`flex items-center text-2xl font-black tracking-wider mb-2 ${pathname === '/resume' ? 'text-txt-red' : 'text-txt-brown'
                }`}
              onClick={toggleMenu}
            >
              <img src={RedFlower.src} alt="" className="w-8 h-8 mr-4" />{' '}
              {isEn ? 'RESUME' : '履歷'}
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/projects"
              className={`flex items-center text-2xl font-black tracking-wider mb-2 ${pathname.startsWith('/projects')
                ? 'text-txt-red'
                : 'text-txt-brown'
                }`}
              onClick={toggleMenu}
            >
              <img src={BlueFlower.src} alt="" className="w-8 h-8 mr-4" />{' '}
              {isEn ? 'PROJECTS' : '作品'}
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};

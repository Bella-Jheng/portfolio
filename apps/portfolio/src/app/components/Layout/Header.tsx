'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Close } from '@/public/icon';
import { BlackFlower, RedFlower, BlueFlower } from '@/public/img';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollBgColor, setScrollBgColor] = useState('');
  const pathname = usePathname();

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
      const r = Math.round(241 + (251 - 241) * progress);
      const g = Math.round(242 + (250 - 242) * progress);
      const b = Math.round(202 + (241 - 202) * progress);

      setScrollBgColor(`rgb(${r}, ${g}, ${b})`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

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
        <div className="flex-1 md:flex-none flex justify-between items-center sm:block border-[2px] border-[#2D1B1B] rounded-xl p-2 md:p-0 sm:border-none md:bg-transparent">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-txt-brown leading-none">
              I'm Yiting.
            </h1>
            <p className="hidden md:block text-md text-gray-700 mt-1">
              A Front-End Software Engineer, good at communication.
            </p>
          </div>

          {/* Hamdurger Menu Icon (Mobile Only) */}
          <button
            onClick={toggleMenu}
            className="sm:hidden flex flex-col justify-between w-6 h-4 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span className="block h-1 w-full bg-[#2D1B1B] rounded-full"></span>
            <span className="block h-1 w-full bg-[#2D1B1B] rounded-full"></span>
            <span className="block h-1 w-full bg-[#2D1B1B] rounded-full"></span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex text-md font-medium items-center space-x-4">
          <Link
            href="/"
            className={`${
              pathname === '/'
                ? 'text-txt-red font-bold'
                : 'text-gray-700 hover:text-txt-brown'
            }`}
          >
            Home
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/resume"
            className={`${
              pathname === '/resume'
                ? 'text-txt-red font-bold'
                : 'text-gray-700 hover:text-txt-brown'
            }`}
          >
            Resume
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/projects"
            className={`${
              pathname.startsWith('/projects')
                ? 'text-txt-red font-bold'
                : 'text-gray-700 hover:text-txt-brown'
            }`}
          >
            Projects
          </Link>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#FBF9E1] flex flex-col p-8 transition-transform duration-500 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-xl font-bold text-txt-brown">I'm Yiting.</h1>
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
              className={`flex items-center text-xl font-black tracking-wider mb-2 ${
                pathname === '/' ? 'text-txt-red' : 'text-txt-brown'
              }`}
              onClick={toggleMenu}
            >
              <img src={BlackFlower.src} alt="" className="w-8 h-8 mr-4" /> HOME
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/resume"
              className={`flex items-center text-2xl font-black tracking-wider mb-2 ${
                pathname === '/resume' ? 'text-txt-red' : 'text-txt-brown'
              }`}
              onClick={toggleMenu}
            >
              <img src={RedFlower.src} alt="" className="w-8 h-8 mr-4" /> RESUME
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>

          <div className="flex flex-col">
            <Link
              href="/projects"
              className={`flex items-center text-2xl font-black tracking-wider mb-2 ${
                pathname.startsWith('/projects')
                  ? 'text-txt-red'
                  : 'text-txt-brown'
              }`}
              onClick={toggleMenu}
            >
              <img src={BlueFlower.src} alt="" className="w-8 h-8 mr-4" />{' '}
              PROJECTS
            </Link>
            <div className="border-b-[3px] border-dashed border-black w-full"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};

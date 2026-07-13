'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight } from '@/public/icon';

const SHOW_AFTER_PX = 400;

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed right-4 md:right-8 bottom-24 md:bottom-8 z-[55] flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-600/90 text-white shadow-lg transition-all duration-300 hover:bg-gray-700 hover:scale-110 hover:shadow-xl active:scale-100 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 -rotate-90" />
    </button>
  );
};

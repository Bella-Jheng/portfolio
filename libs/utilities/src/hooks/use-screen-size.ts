'use client';

import { useState, useEffect } from 'react';

const MD = 768;
const LG = 1024;

export function useScreenSize() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < MD,
    isTablet: width >= MD && width < LG,
    isDesktop: width >= LG,
  };
}

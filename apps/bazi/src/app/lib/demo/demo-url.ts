'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 訪客 Demo 模式以網址上的 ?demo=1 為準：
 * - 站內每次換頁都要把 demo=1 帶著走（用 withDemo 包 href / router.push 的路徑）
 * - 每一頁都會重新檢查網址；網址上沒有 demo=1 就是正式模式（DemoModeSync 會結束訪客體驗）
 */
export const DEMO_PARAM = 'demo';

/** 目前網址是不是 Demo 模式 */
export function isDemoUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get(DEMO_PARAM) === '1';
}

/** Demo 模式時，在站內路徑加上 demo=1（保留原本的 query 和 hash）；正式模式原樣回傳 */
export function withDemo(href: string, demo: boolean): string {
  if (!demo || !href.startsWith('/')) return href;
  const url = new URL(href, 'http://local');
  url.searchParams.set(DEMO_PARAM, '1');
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * 給元件用：目前是不是 Demo 網址，每次換頁重新讀一次。
 * 不用 useSearchParams，避免整個頁面因為要等 Suspense 而退成純前端渲染
 */
export function useDemoUrl(): boolean {
  const pathname = usePathname();
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    setDemo(isDemoUrl());
  }, [pathname]);
  return demo;
}

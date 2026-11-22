'use client';

import { useIsFetching } from '@tanstack/react-query';
import { useLoadingStore } from '../../../store/loading.store';
import { LoadingScreen } from './LoadingScreen';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// 資料在這段時間內就回來的話，不顯示 loading，避免畫面閃一下
const SHOW_DELAY_MS = 200;
// 淡出時間（要跟下面的 duration-300 一致）
const FADE_OUT_MS = 300;

export const GlobalLoading: React.FC = () => {
  // 只算「畫面正在等、而且還沒有資料」的請求；背景預抓（沒有元件在用）不會跳出 loading
  const isFetching = useIsFetching({
    predicate: (query) =>
      query.state.data === undefined && query.getObserversCount() > 0,
  });
  const loadings = useLoadingStore.use.loadings();
  const navigatingTo = useLoadingStore.use.navigatingTo();
  const endNavigation = useLoadingStore.use.endNavigation();
  const pathname = usePathname();
  const isLoading = isFetching > 0 || loadings > 0 || navigatingTo !== null;

  // 換頁中的 loading 只在「真的到了目標頁」才關掉，不會在還停在原頁時先消失。
  // 換到別的頁（例如換頁途中按了返回、點了其他連結）也一併結束。
  const startPath = useRef(pathname);
  useEffect(() => {
    if (navigatingTo === null) {
      startPath.current = pathname;
      return;
    }
    if (pathname === navigatingTo || pathname !== startPath.current) {
      endNavigation();
    }
  }, [pathname, navigatingTo, endNavigation]);

  useEffect(() => {
    if (navigatingTo === null) return;
    // 從瀏覽器的上一頁快取回來（iOS 返回手勢）時，不要卡著 loading
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) endNavigation();
    };
    window.addEventListener('pageshow', onPageShow);
    // 最後保險：30 秒都沒到（網路斷線之類），收起 loading 讓畫面可以操作
    const timer = setTimeout(endNavigation, 30000);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      clearTimeout(timer);
    };
  }, [navigatingTo, endNavigation]);

  const [isMounted, setIsMounted] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsMounted(true);
        setIsShown(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }
    // 資料回來：立刻開始淡出，淡出完就移除，不再額外等待
    setIsShown(false);
    const timer = setTimeout(() => setIsMounted(false), FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return isMounted ? (
    <LoadingScreen
      className={`pointer-events-none transition-opacity duration-300 ease-out ${
        isShown ? 'opacity-100' : 'opacity-0'
      }`}
    />
  ) : null;
};

'use client';

import { useIsFetching } from '@tanstack/react-query';
import { useLoadingStore } from '../../../store/loading.store';
import { LoadingScreen } from './LoadingScreen';
import { useEffect, useState } from 'react';

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
  const isLoading = isFetching > 0 || loadings > 0;

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

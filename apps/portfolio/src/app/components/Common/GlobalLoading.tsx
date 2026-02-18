'use client';

import { useIsFetching } from '@tanstack/react-query';
import { useLoadingStore } from '../../store/loading.store';
import { LoadingScreen } from './LoadingScreen';
import { useEffect, useState } from 'react';

export const GlobalLoading: React.FC = () => {
  const isFetching = useIsFetching();
  const loadings = useLoadingStore.use.loadings();
  const isLoading = isFetching > 0 || loadings > 0;

  const [isVisible, setIsVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      return;
    } else {
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return isVisible ? (
    <LoadingScreen
      className={`transition-opacity duration-1000 ease-out ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    />
  ) : null;
};

import { createSelectors } from '@trg/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoadingStore = {
  loadings: number;
  hasShownInitialLoading: boolean;
  /** 點了連結、正在換頁（換到新頁面時由 GlobalLoading 關掉） */
  isNavigating: boolean;
};

type LoadingActions = {
  showLoading: () => void;
  closeLoading: () => void;
  setInitialLoadingShown: () => void;
  startNavigation: () => void;
  endNavigation: () => void;
};

type LoadingState = LoadingStore & LoadingActions;

const useLoadingStoreBase = create<LoadingState>()(
  devtools(
    (set) => ({
      loadings: 0,
      hasShownInitialLoading: false,
      isNavigating: false,
      showLoading: () => set((state) => ({ loadings: state.loadings + 1 })),
      closeLoading: () =>
        set((state) => ({
          loadings: state.loadings < 1 ? 0 : state.loadings - 1,
        })),
      setInitialLoadingShown: () => set({ hasShownInitialLoading: true }),
      startNavigation: () => set({ isNavigating: true }),
      endNavigation: () => set({ isNavigating: false }),
    }),
    {
      name: 'loading',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export const useLoadingStore = createSelectors(useLoadingStoreBase);

import { createSelectors } from '@trg/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoadingStore = {
  loadings: number;
  hasShownInitialLoading: boolean;
  /** 點了連結、正在換頁的目標路徑；到達這一頁時由 GlobalLoading 清掉（null = 沒在換頁） */
  navigatingTo: string | null;
};

type LoadingActions = {
  showLoading: () => void;
  closeLoading: () => void;
  setInitialLoadingShown: () => void;
  startNavigation: (targetPath: string) => void;
  endNavigation: () => void;
};

type LoadingState = LoadingStore & LoadingActions;

const useLoadingStoreBase = create<LoadingState>()(
  devtools(
    (set) => ({
      loadings: 0,
      hasShownInitialLoading: false,
      navigatingTo: null,
      showLoading: () => set((state) => ({ loadings: state.loadings + 1 })),
      closeLoading: () =>
        set((state) => ({
          loadings: state.loadings < 1 ? 0 : state.loadings - 1,
        })),
      setInitialLoadingShown: () => set({ hasShownInitialLoading: true }),
      startNavigation: (targetPath) => set({ navigatingTo: targetPath }),
      endNavigation: () => set({ navigatingTo: null }),
    }),
    {
      name: 'loading',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export const useLoadingStore = createSelectors(useLoadingStoreBase);

import { createSelectors } from '@trg/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoadingStore = {
  loadings: number;
  hasShownInitialLoading: boolean;
};

type LoadingActions = {
  showLoading: () => void;
  closeLoading: () => void;
  setInitialLoadingShown: () => void;
};

type LoadingState = LoadingStore & LoadingActions;

const useLoadingStoreBase = create<LoadingState>()(
  devtools(
    (set) => ({
      loadings: 0,
      hasShownInitialLoading: false,
      showLoading: () => set((state) => ({ loadings: state.loadings + 1 })),
      closeLoading: () =>
        set((state) => ({
          loadings: state.loadings < 1 ? 0 : state.loadings - 1,
        })),
      setInitialLoadingShown: () => set({ hasShownInitialLoading: true }),
    }),
    {
      name: 'loading',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export const useLoadingStore = createSelectors(useLoadingStoreBase);

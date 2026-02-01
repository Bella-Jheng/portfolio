import { createSelectors } from '@trg/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type LoadingStore = {
  loadings: number;
};

type LoadingActions = {
  showLoading: () => void;
  closeLoading: () => void;
};

type LoadingState = LoadingStore & LoadingActions;

const useLoadingStoreBase = create<LoadingState>()(
  devtools(
    (set) => ({
      loadings: 0,
      showLoading: () => set((state) => ({ loadings: state.loadings + 1 })),
      closeLoading: () =>
        set((state) => ({
          loadings: state.loadings < 1 ? 0 : state.loadings - 1,
        })),
    }),
    {
      name: 'loading',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

export const useLoadingStore = createSelectors(useLoadingStoreBase);

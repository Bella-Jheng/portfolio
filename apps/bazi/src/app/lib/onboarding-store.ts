import { create } from 'zustand';

/** 第一次介紹：看過就記在 localStorage，之後只能從「我的」頁重看 */
export const ONBOARDED_KEY = 'bazi:onboarded';

/** 介紹的最後一頁是「加到主畫面」 */
export const INSTALL_STEP = 3;

interface OnboardingState {
  splashDone: boolean;
  open: boolean;
  step: number;
  markSplashDone: () => void;
  show: (step?: number) => void;
  setStep: (step: number) => void;
  close: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  splashDone: false,
  open: false,
  step: 0,
  markSplashDone: () => set({ splashDone: true }),
  show: (step = 0) => set({ open: true, step }),
  setStep: (step) => set({ step }),
  close: () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* 存不了就算了，下次還會再看到介紹 */
    }
    set({ open: false });
  },
}));

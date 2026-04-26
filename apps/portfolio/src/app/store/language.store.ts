import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Language = 'zh' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  devtools(
    persist(
      (set) => ({
        language: 'zh',
        setLanguage: (lang) => set({ language: lang }),
        toggleLanguage: () =>
          set((state) => ({
            language: state.language === 'zh' ? 'en' : 'zh',
          })),
      }),
      {
        name: 'language-storage',
      }
    ),
    {
      name: 'language',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

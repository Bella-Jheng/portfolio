import { useLanguageStore } from '../store/language.store';

export const useLanguage = () => {
  const { language } = useLanguageStore();
  const isEn = language === 'en';

  /**
   * Helper to pick the correct translation from an object with zh and en keys.
   */
  const translate = <T>(translations: { zh: T; en: T }): T => {
    return translations[language];
  };

  return { language, isEn, t: translate };
};

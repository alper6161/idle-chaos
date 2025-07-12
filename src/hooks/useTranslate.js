import { useTranslation } from 'react-i18next';

export const useTranslate = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '/images/flags/UnitedKingdom.png' },
      { code: 'tr', name: 'Türkçe', flag: '/images/flags/Turkey.png' }
    ];
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    currentLanguage: i18n.language
  };
}; 
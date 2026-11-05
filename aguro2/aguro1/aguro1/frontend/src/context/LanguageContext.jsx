import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import mlTranslations from '../translations/ml.json';
import hiTranslations from '../translations/hi.json';

const translationsMap = {
  en: enTranslations,
  ml: mlTranslations,
  hi: hiTranslations,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agroguide_lang') || 'en';
  });

  const switchLanguage = (lang) => {
    if (translationsMap[lang]) {
      setLanguage(lang);
      localStorage.setItem('agroguide_lang', lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('agroguide-language-change', { detail: lang }));
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail);
    window.addEventListener('agroguide-language-change', handleLanguageChange);
    return () => window.removeEventListener('agroguide-language-change', handleLanguageChange);
  }, []);

  // Nested translation helper: t('nav.dashboard')
  const t = (keyPath, fallback = '') => {
    const currentDict = translationsMap[language] || enTranslations;
    const keys = keyPath.split('.');
    let val = currentDict;

    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        // Fallback to English
        let fallbackVal = enTranslations;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            return fallback || keyPath;
          }
        }
        return fallbackVal || fallback || keyPath;
      }
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

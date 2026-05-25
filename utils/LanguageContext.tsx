import React, { createContext, useContext, useState, useEffect } from 'react';
import { t } from './trtoentranslate';

export type Language = 'TR' | 'EN';

interface LanguageContextProps {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language_preference') as Language | null;
    if (saved === 'TR' || saved === 'EN') return saved;

    // Tarayıcı veya sistem dilini kontrol et
    const browserLang = typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';
    return browserLang.startsWith('tr') ? 'TR' : 'EN';
  });
  const [showProgress, setShowProgress] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const changeLanguage = (newLang: Language) => {
    if (newLang === language) return;
    setPendingLanguage(newLang);
    setShowProgress(true);
  };

  useEffect(() => {
    if (showProgress && pendingLanguage) {
      const timer = setTimeout(() => {
        setLanguage(pendingLanguage);
        localStorage.setItem('language_preference', pendingLanguage);
        setShowProgress(false);
        setPendingLanguage(null);
      }, 850); // Sleek transition speed
      return () => clearTimeout(timer);
    }
  }, [showProgress, pendingLanguage]);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const translate = (key: string) => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: translate }}>
      {children}
      {showProgress && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

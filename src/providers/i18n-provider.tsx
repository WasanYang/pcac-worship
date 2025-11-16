'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import en from '@/lib/locales/en.json'; // Assuming this is a flat object for now
import th from '@/lib/locales/th.json'; // Assuming this is a flat object for now

type Locale = 'en' | 'th';

type TranslationKey = keyof typeof en;

type Translations = {
  [key in Locale]: { [key: string]: any };
};

const translations: Translations = { en, th };

const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const replacePlaceholders = (
  text: string,
  values: Record<string, string | number>
): string => {
  return Object.keys(values).reduce((acc, key) => {
    const regex = new RegExp(`{${key}}`, 'g');
    return acc.replace(regex, String(values[key]));
  }, text);
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && ['en', 'th'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      let translatedText =
        getNestedTranslation(translations[locale], key) ??
        getNestedTranslation(translations['en'], key);

      // If the result is not a string (e.g., it's an object because the key was partial),
      // return the original key to avoid React errors and aid in debugging.
      if (typeof translatedText !== 'string') {
        return key;
      }

      if (values) {
        translatedText = replacePlaceholders(translatedText, values);
      }
      return translatedText;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

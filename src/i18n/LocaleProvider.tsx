"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { locales, defaultLocale, type Locale, localeNames, prependLocaleToPath, stripLocaleFromPath } from "@/i18n/config";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LocaleProvider({ children, initialLocale = defaultLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    const currentPath = stripLocaleFromPath(window.location.pathname);
    const newPath = prependLocaleToPath(currentPath, newLocale);
    window.location.href = newPath;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, locales, localeNames }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
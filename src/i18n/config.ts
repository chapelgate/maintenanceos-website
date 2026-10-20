export const locales = ["en-GB", "en-US", "cy-GB", "fr-FR", "de-DE"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-GB";

export const localeNames: Record<Locale, string> = {
  "en-GB": "English (UK)",
  "en-US": "English (US)",
  "cy-GB": "Cymraeg",
  "fr-FR": "Français",
  "de-DE": "Deutsch",
};

export const localeNativeNames: Record<Locale, string> = {
  "en-GB": "English (UK)",
  "en-US": "English (US)",
  "cy-GB": "Cymraeg",
  "fr-FR": "Français",
  "de-DE": "Deutsch",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const potentialLocale = segments[0];
  return isValidLocale(potentialLocale) ? potentialLocale : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function prependLocaleToPath(pathname: string, locale: Locale): string {
  if (pathname === "/") return `/${locale}/`;
  return `/${locale}${pathname}`;
}
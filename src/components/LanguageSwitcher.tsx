"use client";

import { useLocale } from "@/i18n/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, locales, localeNames } = useLocale();

  return (
    <details className="relative" aria-label={localeNames[locale]}>
      <summary
        className="site-nav-link inline-flex h-9 min-h-6 min-w-6 cursor-pointer list-none items-center justify-center gap-1 rounded-md px-2.5 text-sm font-medium text-ink hover:text-accent [&::-webkit-details-marker]:hidden"
        aria-expanded="false"
      >
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg
          className="ml-1 opacity-60"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <ul className="site-menu-panel absolute right-0 top-full z-50 mt-2 min-w-[12rem] rounded-xl border border-border bg-surface py-2 shadow-[var(--mos-shadow)]">
        {locales.map((loc) => (
          <li key={loc}>
            <button
              onClick={() => setLocale(loc)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                locale === loc
                  ? "font-medium text-accent bg-paper"
                  : "text-muted hover:bg-paper hover:text-ink"
              }`}
              aria-current={locale === loc ? "page" : undefined}
            >
              {localeNames[loc]}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
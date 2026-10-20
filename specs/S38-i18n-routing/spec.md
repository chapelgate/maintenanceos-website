# S38: i18n Routing Implementation

## Objective
Implement multilingual routing for WorkSmartOS website with 5 locales: en-GB (default), en-US, cy-GB, fr-FR, de-DE.

## Scope
- Middleware-based locale detection and routing
- Dictionary-based translations for all UI strings
- Language switcher component in header
- hreflang tags for SEO
- Static export compatible (generateStaticParams for all locales)

## Files Created
- `src/i18n/config.ts` - Locale configuration and utilities
- `src/i18n/dictionaries/en-GB.ts` - English (UK) dictionary (base)
- `src/i18n/dictionaries/en-US.ts` - English (US) dictionary
- `src/i18n/dictionaries/cy-GB.ts` - Welsh dictionary
- `src/i18n/dictionaries/fr-FR.ts` - French dictionary
- `src/i18n/dictionaries/de-DE.ts` - German dictionary
- `src/i18n/dictionaries/index.ts` - Dictionary loader
- `src/i18n/LocaleProvider.tsx` - Client-side locale context
- `src/components/LanguageSwitcher.tsx` - Language switcher dropdown
- `src/middleware.ts` - Locale detection and routing middleware
- `src/app/[locale]/layout.tsx` - Locale-aware root layout with hreflang
- `src/app/[locale]/not-found.tsx` - 404 page with main landmark
- `src/app/[locale]/page.tsx` - Root redirect to default locale

## Files Modified
- `src/app/[locale]/blog/rss.xml/route.ts` - Added generateStaticParams for locales
- `src/components/SiteHeader.tsx` - Added LanguageSwitcher to desktop nav
- Test files updated for new [locale] paths

## Acceptance Criteria
- `/en-US/`, `/cy-GB/`, `/fr-FR/`, `/de-DE/` render correctly
- hreflang tags present on all pages
- Language switcher works and persists locale
- Static export generates pages for all 5 locales
- Build passes, TypeScript clean, lint clean
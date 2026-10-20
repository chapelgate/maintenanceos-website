# S38: i18n Routing Implementation Plan

## Approach
Implement Next.js App Router i18n with middleware-based locale detection and static export compatibility.

## Architecture
1. **Middleware** (`src/middleware.ts`): Detects locale from Accept-Language header, redirects root paths to default locale
2. **Locale Segment** (`src/app/[locale]/`): All pages under dynamic locale segment for static generation
3. **Dictionaries** (`src/i18n/dictionaries/`): Per-locale translation files loaded on demand
4. **LocaleProvider** (`src/i18n/LocaleProvider.tsx`): React context for client-side locale switching
5. **LanguageSwitcher** (`src/components/LanguageSwitcher.tsx`): Dropdown in header for manual locale selection
5. **Hreflang Tags**: Added in layout.tsx for SEO

## Static Export Compatibility
- Use `generateStaticParams` in layout.tsx to generate all locale variants
- Middleware runs at runtime on DO App Platform for locale detection
- RSS route updated with generateStaticParams for locale variants

## Dictionary Structure
- Base: en-GB (complete)
- Other locales: en-US, cy-GB, fr-FR, de-DE (full translations)
- Dictionary type: `Record<string, unknown>` for flexibility

## Testing
- Build verification: `npm run build` generates 456 pages (5 locales × ~91 pages)
- TypeScript: `npx tsc --noEmit` passes
- Lint: `npm run lint` passes (warnings only)
- Unit tests: Pre-existing tests need path updates (tracked separately)
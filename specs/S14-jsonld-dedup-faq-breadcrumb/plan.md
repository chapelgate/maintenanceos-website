# S14 Implementation Plan

## Approach

1. **Add new JSON-LD factory functions** in `src/lib/json-ld.ts`:
   - `fullFunnelPageJsonLd(page)` - single graph with Organization, WebSite, WebPage, SoftwareApplication, BreadcrumbList
   - `fullFaqPageJsonLd()` - single graph with Organization, WebSite, FAQPage, BreadcrumbList
   - `contentPageJsonLd(path, title, description, breadcrumbLabels)` - single graph with Organization, WebSite, WebPage, BreadcrumbList

2. **Remove JSON-LD from root layout** (`src/app/layout.tsx`):
   - Remove `<JsonLd data={marketingJsonLd()} />` import and usage

3. **Update all funnel pages** to use `fullFunnelPageJsonLd`:
   - `src/app/page.tsx` (home)
   - `src/app/create/page.tsx`
   - `src/app/demo/page.tsx`
   - `src/app/features/page.tsx`
   - `src/app/how-it-works/page.tsx`
   - `src/app/property-maintenance-software/page.tsx`

4. **Update FAQ page** to use `fullFaqPageJsonLd`:
   - `src/app/faq/page.tsx`

5. **Update content pages** to use `contentPageJsonLd`:
   - `src/app/about/page.tsx`
   - `src/app/contact/page.tsx`
   - `src/app/ai-receptionist/page.tsx`
   - `src/app/security/page.tsx`
   - `src/app/subprocessors/page.tsx`
   - `src/app/privacy/page.tsx`
   - `src/app/cookies/page.tsx`
   - `src/app/terms/page.tsx`
   - `src/app/accessibility/page.tsx`
   - `src/app/vulnerability-disclosure/page.tsx`
   - `src/app/industries/page.tsx`
   - `src/app/how-we-keep-control/page.tsx`

6. **Update tests** to verify new behavior:
   - `scripts/seo-funnel-jsonld.test.mjs` - expect single JSON-LD block with BreadcrumbList
   - `scripts/seo-intent.test.mjs` - expect `fullFunnelPageJsonLd`
   - `scripts/marketing-funnel-copy.test.mjs` - expect `fullFaqPageJsonLd`

## Files to Modify

- `src/lib/json-ld.ts` - add new factory functions
- `src/app/layout.tsx` - remove marketingJsonLd
- 6 funnel pages - switch to fullFunnelPageJsonLd
- 1 FAQ page - switch to fullFaqPageJsonLd
- 12 content pages - add contentPageJsonLd
- 3 test files - update assertions

## Verification

- `npm run build` passes
- `npx tsc --noEmit` passes
- `npx eslint` passes (warnings only)
- `npm test` passes (274/275, 1 pre-existing piper-http failure)
- Exported HTML: exactly 1 JSON-LD block per page
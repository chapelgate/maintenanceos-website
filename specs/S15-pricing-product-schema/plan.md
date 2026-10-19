# S15: Product Schema for /pricing/ Page - Plan

## Approach
1. Add `pricingPageProductJsonLd()` function to `src/lib/json-ld.ts`
2. Include Product schema with Organization, WebSite, Product, and BreadcrumbList in @graph
3. Set `offers.availability` to `https://schema.org/PreOrder`
4. Set `offers.priceSpecification` to `null`
5. Update `src/app/pricing/page.tsx` to render the JSON-LD
6. Update test to allow PreOrder in pricing function while keeping funnel functions claims-safe

## Files to Modify
- `src/lib/json-ld.ts` - Add new function
- `src/app/pricing/page.tsx` - Import and render JsonLd component
- `scripts/seo-funnel-jsonld.test.mjs` - Update test to allow PreOrder in pricing function

## Verification
- Run `npm run build` - must pass
- Run `npx tsc --noEmit` - must pass
- Run `npm run lint` - must pass (warnings OK)
- Run `npm test` - must pass (except pre-existing piper-http failure)
- Verify generated HTML contains Product schema with correct availability
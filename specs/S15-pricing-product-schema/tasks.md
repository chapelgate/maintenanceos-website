# S15: Product Schema for /pricing/ Page - Tasks

- [x] Add `pricingPageProductJsonLd()` function to `src/lib/json-ld.ts`
- [x] Update `src/app/pricing/page.tsx` to render the JSON-LD
- [x] Update `scripts/seo-funnel-jsonld.test.mjs` to allow PreOrder in pricing function
- [x] Run `npm run build` - PASS
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS
- [x] Run `npm test` - PASS (except pre-existing piper-http failure)
- [x] Verify generated HTML contains Product schema with `availability: https://schema.org/PreOrder` and `priceSpecification: null`
- [x] Create spec artifact files (spec.md, plan.md, tasks.md)
- [x] Commit and push changes
- [x] Open PR with Estate headers
- [x] Wait for CI checks (estate-gate, webkit-a11y) to pass
- [x] Merge PR when all checks green
- [x] Verify live acceptance test against https://worksmartos.co.uk
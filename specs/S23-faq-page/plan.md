# S23 Implementation Plan

## Overview
The FAQ page was rebuilt with a new FaqAccordion component that provides searchable, keyboard-accessible accordion functionality. The page uses a single JSON-LD graph including FAQPage schema for "People Also Ask" eligibility.

## Changes
1. Created `src/components/FaqAccordion.tsx` - new client component with search and keyboard navigation
2. Updated `src/app/faq/page.tsx` to use FaqAccordion instead of legacy Accordion component
3. Updated `src/content/faqs.ts` with claims-safe FAQ copy (product + safety categories)
4. Extended `src/lib/json-ld.ts` with `fullFaqPageJsonLd()` generating single graph with FAQPage + BreadcrumbList
5. Updated tests in `scripts/commercial-uplift.test.mjs` and `scripts/marketing-funnel-copy.test.mjs` to verify new component

## Testing
- Run `npm run build` — passes
- Run `npm test` — all tests pass (except pre-existing piper-http failure)
- Run `npm run lint` — passes (pre-existing warnings only)
- Run `npx tsc --noEmit` — passes
- Verify static output: `out/faq/index.html` contains exactly one `application/ld+json` script with FAQPage

## Acceptance Verification
- Local: `Select-String -Pattern '"@type":"FAQPage"' out\faq\index.html` → matches
- Local: `Select-String -Pattern "FaqAccordion" out\faq\index.html` → matches
- Live: Rich Results Test on https://worksmartos.co.uk/faq/ → "FAQPage detected"
- Live: Page searchable and keyboard accessible
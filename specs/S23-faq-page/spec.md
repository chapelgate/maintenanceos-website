# S23: Build proper `/faq/` page with searchable accordion + FAQPage schema

## Goal
"People Also Ask" eligibility; better conversion

## Acceptance Criteria
- Rich Results Test: "FAQPage detected" on /faq/
- Page searchable: search input filters questions in real-time
- Accordion keyboard accessible: ArrowUp, ArrowDown, Home, End, Enter/Space navigation works
- Exactly one JSON-LD block with FAQPage + BreadcrumbList on /faq/
- Build passes, TypeScript clean, lint clean, tests pass (except pre-existing piper-http failure)

## Scope
- Files: `src/app/faq/page.tsx`, `src/components/FaqAccordion.tsx`, `src/content/faqs.ts`, `src/lib/json-ld.ts`
- Tests: `scripts/commercial-uplift.test.mjs` (updated), `scripts/marketing-funnel-copy.test.mjs` (updated)

## Verification
The FAQ page uses a single JSON-LD graph (`fullFaqPageJsonLd`) containing Organization, WebSite, FAQPage (with all 8 Q&A pairs from `faqItems`), and BreadcrumbList. The FaqAccordion component provides real-time search filtering and full keyboard navigation (ArrowUp/Down, Home/End, Enter/Space). The accordion uses native `<details>/<summary>` with proper ARIA attributes (`aria-expanded`, `aria-controls`, `role="button"`, `tabIndex=0`).
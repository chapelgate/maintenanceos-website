# S23 Tasks

- [x] Create `src/components/FaqAccordion.tsx` with search and keyboard navigation
- [x] Update `src/app/faq/page.tsx` to use FaqAccordion
- [x] Update `src/content/faqs.ts` with claims-safe FAQ items
- [x] Extend `src/lib/json-ld.ts` with `fullFaqPageJsonLd()` 
- [x] Update `scripts/commercial-uplift.test.mjs` to check for FaqAccordion
- [x] Update `scripts/marketing-funnel-copy.test.mjs` to check for faqItems and fullFaqPageJsonLd
- [x] Run `npm run build` — passes
- [x] Run `npm test` — all tests pass (except pre-existing piper-http failure)
- [x] Run `npm run lint` — passes
- [x] Run `npx tsc --noEmit` — passes
- [x] Create specs/S23-faq-page/{spec.md,plan.md,tasks.md}
- [ ] Commit and push branch
- [ ] Open PR with Estate-Preflight headers
- [ ] Wait for CI (estate-gate, webkit-a11y)
- [ ] Merge when all checks pass
- [ ] Verify live acceptance: Rich Results Test on /faq/, page searchable, keyboard accessible
- [ ] Update IMPL_STATE.md
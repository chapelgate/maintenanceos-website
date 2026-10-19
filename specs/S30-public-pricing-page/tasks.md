# S30: Public Pricing Page - Tasks

- [ ] Update `src/config/pricing.ts` with 3 tier structures (placeholders for Andy's prices)
- [ ] Update `src/app/pricing/page.tsx` to render tier cards in published mode
- [ ] Update `scripts/pricing-copy.test.mjs` to verify tier rendering
- [ ] Run `npm run build` - PASS
- [ ] Run `npx tsc --noEmit` - PASS
- [ ] Run `npm run lint` - PASS
- [ ] Run `npm test` - PASS (except pre-existing piper-http failure)
- [ ] Create spec artifact files (spec.md, plan.md, tasks.md)
- [ ] Commit and push changes
- [ ] Open PR with Estate headers
- [ ] Wait for CI checks (estate-gate, validate, webkit-a11y) to pass
- [ ] Merge PR when all checks green
- [ ] Verify live acceptance test against https://worksmartos.co.uk
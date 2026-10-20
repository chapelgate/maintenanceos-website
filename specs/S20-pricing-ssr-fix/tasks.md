# S20 Tasks

- [x] Verify pricing page static output contains `<h1>Pricing</h1>`
- [x] Add test in `scripts/pricing-copy.test.mjs` for h1 heading verification
- [x] Run `npm run build` — passes
- [x] Run `npm test` — all tests pass (except pre-existing piper-http failure)
- [x] Run `npm run lint` — passes
- [x] Run `npx tsc --noEmit` — passes
- [x] Create specs/S20-pricing-ssr-fix/{spec.md,plan.md,tasks.md}
- [x] Commit and push branch
- [x] Open PR with Estate-Preflight headers
- [x] Wait for CI (estate-gate, webkit-a11y)
- [x] Merge when all checks pass
- [x] Verify live acceptance: `curl https://worksmartos.co.uk/pricing/ | grep -c '<h1'`
- [x] Update IMPL_STATE.md
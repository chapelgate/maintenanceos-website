# CI Validate Workflow Scanner Stub Fix - Tasks

- [x] Update src/config/site.ts to use NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT env var
- [x] Update validate workflow to not set NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT at build time
- [x] Update tests: create-a11y.test.mjs, fonio-local-smoke.test.mjs, product-evidence-refresh.test.mjs, staging-companions.test.mjs
- [x] Run local verification: npm ci, npx tsc --noEmit, npm run lint, npm test, npm run build
- [x] Push branch and create PR
- [ ] Wait for CI (estate-gate, validate, webkit-a11y) to pass
- [ ] Merge PR
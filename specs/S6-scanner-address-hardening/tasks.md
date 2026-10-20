# S6 Tasks

## Completed
- [x] Add `validatePostcodeWithPostcodesIo()` function to extract.ts
- [x] Add `checkCompaniesHouse()` function to extract.ts
- [x] Add `PostcodeValidationResult` and `CompaniesHouseCheckResult` type definitions
- [x] Add tests for new functions in extract.test.ts
- [x] Verify existing address tests in scanner-round3.test.ts still pass
- [x] Run TypeScript check (npx tsc --noEmit) — PASS
- [x] Run lint (npm run lint) — PASS (5 pre-existing warnings)
- [x] Run tests (npm test) — PASS (279 pass, 1 pre-existing failure)
- [x] Run build (npm run build) — PASS
- [x] Commit and push to feat/S6-scanner-address-hardening
- [x] Create specs/S6-scanner-address-hardening/{spec.md,plan.md,tasks.md}

## Pending (Follow-up)
- [ ] Integrate validation functions into scanner-v2-runtime.ts address processing
- [ ] Add CH_API_KEY and POSTCODES_IO_KEY to droplet/function environment (Andy/DROPLET_OR_FUNCTION)
- [ ] Run benchmark: `npm run benchmark:scanner -- --field=address --sites=golden`
- [ ] Verify acceptance criteria: Correct ≥70%, Partial ≤10%
- [ ] Open PR with required Estate-Preflight headers
- [ ] Wait for CI (estate-gate, validate, webkit-a11y)
- [ ] Merge PR when all checks green
- [ ] Update IMPL_STATE.md with PR number and SHA
- [ ] Run live acceptance check against https://worksmartos.co.uk

## Notes
- The validation functions are ready for integration but need to be called from the scanner runtime
- Companies House API key required from Andy (A19)
- postcodes.io free tier available, no key required for basic usage
- Current implementation returns undefined on API failure — graceful degradation
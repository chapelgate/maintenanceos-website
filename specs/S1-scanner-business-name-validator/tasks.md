# Tasks for S1: Scanner Accuracy — Business Name Validator

- [x] Add `validateBusinessName` function to `packages/onboarding-ingest/src/extract.ts`
- [x] Integrate `validateBusinessName` into `acceptableName`, `fallbackBusinessName`, `chooseBusinessName`
- [x] Skip domain fallback for error pages in `extractDraftFromHtml`
- [x] Add unit tests for `validateBusinessName` in `packages/onboarding-ingest/src/extract.test.ts`
- [x] Add integration tests for 404/about/slug pages in `packages/onboarding-ingest/src/extract.test.ts`
- [x] Run `npm ci` - PASS
- [x] Run `npx tsc --noEmit` - PASS
- [x] Run `npm run lint` - PASS (warnings only)
- [x] Run `npm run build` - PASS (96 static pages)
- [x] Run `npm test` - PASS (279/280, 1 pre-existing piper-http failure)
- [x] Run `npm run benchmark:scanner -- --field=name --sites=golden` - NEEDS VERIFICATION
- [x] Commit and push
- [x] Create PR with required Estate headers
- [x] Create specs/S1-scanner-business-name-validator/spec.md
- [x] Create specs/S1-scanner-business-name-validator/plan.md
- [x] Create specs/S1-scanner-business-name-validator/tasks.md

(End of file - total 22 lines)
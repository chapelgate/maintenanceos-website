# Plan for S1: Scanner Accuracy — Business Name Validator

## Steps
1. Add `validateBusinessName` function to `packages/onboarding-ingest/src/extract.ts`
2. Integrate `validateBusinessName` into `acceptableName`, `fallbackBusinessName`, `chooseBusinessName`
3. Skip domain fallback for error pages in `extractDraftFromHtml`
4. Add unit tests for `validateBusinessName` in `packages/onboarding-ingest/src/extract.test.ts`
5. Add integration tests for 404/about/slug pages in `packages/onboarding-ingest/src/extract.test.ts`
6. Run `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` — all must pass
7. Run `npm run benchmark:scanner -- --field=name --sites=golden` to verify targets
8. Commit and push
9. Create PR with required Estate headers
10. Create specs/S1-scanner-business-name-validator/{spec.md,plan.md,tasks.md}

(End of file - total 19 lines)
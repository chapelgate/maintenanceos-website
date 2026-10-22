# S7 Tasks - Confidence Gating + Unknown UI

- [x] Export `aggregateFacts` function from `packages/onboarding-ingest/src/scanner-v2-runtime.ts`
- [x] Export `draftFromFacts` function from `packages/onboarding-ingest/src/scanner-v2-runtime.ts`
- [x] Add confidence filtering logic in `aggregateFacts` to remove low-confidence businessName, address, hours
- [x] Add confidence filtering logic in `aggregateFacts` to filter low-confidence services items
- [x] Add confidence filtering logic in `aggregateFacts` to filter low-confidence faqs items
- [x] Update `draftFromFacts` to return "Unknown — not found" for omitted fields
- [x] Create `src/lib/types.ts` with shared type definitions (BusinessFacts, BusinessFactMeta, PartialDraft)
- [x] Create `src/components/ScanDraftReview.tsx` for the review UI showing "Unknown — not found" for omitted fields
- [x] Update tests in `packages/onboarding-ingest/src/scanner-v2-runtime.test.ts` to verify new behavior (businessName = "Unknown — not found" for empty results)
- [x] All existing tests pass (`npm test`)
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Lint passes (`npm run lint`)
- [x] Build passes (`npm run build`)
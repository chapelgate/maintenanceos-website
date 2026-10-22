# S7 Plan - Confidence Gating + Unknown UI

## Implementation Steps

1. **Export `aggregateFacts` and `draftFromFacts`** from `packages/onboarding-ingest/src/scanner-v2-runtime.ts`
2. **Add confidence filtering** in `aggregateFacts`:
   - Remove low-confidence businessName, address, hours from facts
   - Filter out low-confidence services items
   - Filter out low-confidence faqs items
3. **Update `draftFromFacts`** to return "Unknown — not found" for omitted fields
4. **Create `src/lib/types.ts`** with shared type definitions
5. **Create `src/components/ScanDraftReview.tsx`** for the review UI
6. **Update tests** in `packages/onboarding-ingest/src/scanner-v2-runtime.test.ts` to verify new behavior

## Files to Modify
- `packages/onboarding-ingest/src/scanner-v2-runtime.ts`
- `packages/onboarding-ingest/src/scanner-v2-runtime.test.ts`
- `src/lib/types.ts` (new)
- `src/components/ScanDraftReview.tsx` (new)
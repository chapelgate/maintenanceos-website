# S7 Scanner Accuracy — Confidence Gating + "Unknown — not found" UI

## Summary
Implement confidence gating in the scanner's fact aggregation so that low-confidence fields are omitted from the final facts object. Update the draft generation to show "Unknown — not found" for omitted fields instead of leaving them blank. Add a review component to display the draft with clear "Unknown — not found" labels.

## Acceptance Criteria
1. `aggregateFacts` exports and removes low-confidence businessName, address, hours, services items, and faqs items from the returned facts object
2. `draftFromFacts` exports and returns "Unknown — not found" for any omitted field
3. New `ScanDraftReview` component in `src/components/ScanDraftReview.tsx` displays the draft with appropriate labels
4. Shared types in `src/lib/types.ts` for BusinessFacts, BusinessFactMeta, PartialDraft
5. All existing tests pass
6. New tests verify the confidence gating and "Unknown — not found" behavior

## Changes
- Export `aggregateFacts` and `draftFromFacts` from `packages/onboarding-ingest/src/scanner-v2-runtime.ts`
- Add confidence filtering logic in `aggregateFacts` for businessName, address, hours, services, faqs
- Update `draftFromFacts` to return "Unknown — not found" for missing fields
- Create `src/components/ScanDraftReview.tsx` for UI
- Create `src/lib/types.ts` with shared type definitions
- Add tests for the new behavior
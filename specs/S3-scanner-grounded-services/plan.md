# S3: Scanner Accuracy - Grounded Services Extraction - Plan

## Approach
1. Remove extractServiceSubheadings function from packages/onboarding-ingest/src/extract.ts
2. Add extractGroundedServices function that:
   - Extracts services from JSON-LD (makesOffer, hasOfferCatalog, serviceType)
   - Extracts services from service pages using serviceItemsUnderHeading (stops at same/higher level headings)
   - Only processes pages identified by isServiceSourceUrl
3. Update extractDraftFromHtml to use extractGroundedServices instead of three separate extraction methods
4. Update tests to reflect new grounded extraction behavior

## Files to Modify
- packages/onboarding-ingest/src/extract.ts - Remove extractServiceSubheadings, add extractGroundedServices, update extractDraftFromHtml
- packages/onboarding-ingest/src/extract.test.ts - Add test for extractGroundedServices, update failing tests
- packages/onboarding-ingest/src/scan.test.ts - Update failing test

## Verification
- Run `npm run build` - must pass
- Run `npx tsc --noEmit` - must pass
- Run `npm run lint` - must pass (warnings OK)
- Run `npm test` - must pass (except pre-existing piper-http and pricing static output failures)
- Verify no nav-based or subheading-based services extraction

(End of file - total 22 lines)
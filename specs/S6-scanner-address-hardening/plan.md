# S6 Implementation Plan

## Overview
Implement address validation using postcodes.io and Companies House APIs to improve scanner accuracy for address fields.

## Steps

1. **Add validation functions to extract.ts** ✓
   - `validatePostcodeWithPostcodesIo()` - validates UK postcodes via postcodes.io
   - `checkCompaniesHouse()` - verifies business addresses against Companies House
   - Export `PostcodeValidationResult` and `CompaniesHouseCheckResult` types

2. **Add tests to extract.test.ts** ✓
   - Test valid/invalid postcode validation
   - Test Companies House check (with/without API key)
   - Test addressAroundPostcode still works correctly

3. **Verify existing tests pass** ✓
   - scanner-round3.test.ts address tests still pass
   - All 279 tests pass (1 pre-existing piper-http failure)

4. **Integrate with scanner runtime** (follow-up)
   - Call validation functions from scanner-v2-runtime.ts when processing addresses
   - Use CH_API_KEY and POSTCODES_IO_KEY environment variables
   - Add validation results to address factMeta

5. **Run benchmark** (follow-up)
   - Execute `npm run benchmark:scanner -- --field=address --sites=golden`
   - Verify Correct ≥70%, Partial ≤10%

## Dependencies
- S0 (Inter font fix) — ✓ Done
- Requires CH_API_KEY (Andy item A19) for Companies House
- postcodes.io free tier for postcode validation

## Risks
- External API dependencies may fail or rate-limit
- Companies House API requires paid tier for production use
- Need to handle API failures gracefully (return undefined, don't block scan)
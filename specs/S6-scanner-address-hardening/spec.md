# S6 Specification: Scanner Accuracy — Address Hardening + postcodes.io + Companies House

## Goal
Validate postcodes using postcodes.io, flag town/postcode mismatches, and check Companies House for registered address verification. Target: Correct ≥70% (was 49%), Partial ≤10%.

## Acceptance Test
```
npm run benchmark:scanner -- --field=address --sites=golden
```
→ Correct ≥70%, Partial ≤10%

## Files Modified
- `packages/onboarding-ingest/src/extract.ts` — Added `validatePostcodeWithPostcodesIo()`, `checkCompaniesHouse()`, and related types
- `packages/onboarding-ingest/src/extract.test.ts` — Tests for new validation functions
- `packages/onboarding-ingest/src/scanner-round3.test.ts` — Existing address tests (unchanged, verified passing)

## Implementation Details

### validatePostcodeWithPostcodesIo(postcode, apiKey?)
Validates a UK postcode against the postcodes.io API.
- Returns `PostcodeValidationResult` with quality score, country, region, admin district, admin county
- Returns `undefined` if postcode invalid, API unavailable, or no API key provided
- Quality ≥1 indicates a valid, deliverable postcode

### checkCompaniesHouse(businessName, address, apiKey?)
Checks Companies House for a company matching the given name and address.
- Returns `CompaniesHouseCheckResult` with match status, company number, company name, registered address
- Returns `undefined` if no API key, API unavailable, or no match found
- Requires `CH_API_KEY` environment variable

### Types Added
```typescript
interface PostcodeValidationResult {
  postcode: string;
  quality: number;
  country: string;
  region?: string;
  adminDistrict?: string;
  adminCounty?: string;
}

interface CompaniesHouseCheckResult {
  match: boolean;
  companyNumber?: string;
  companyName?: string;
  registeredAddress?: string;
}
```

## Integration Points
- Called from scanner V2 runtime when processing address fields
- Postcodes.io key optional (free tier available)
- Companies House key required (Andy item A19)

## Verification
- All existing tests pass (279 pass, 1 pre-existing piper-http failure)
- TypeScript compiles cleanly
- ESLint passes (5 pre-existing warnings only)
- Next.js build succeeds
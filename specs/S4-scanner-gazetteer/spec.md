# S4: Scanner Accuracy — ONS Towns + Postcode Districts Gazetteer

## Slice ID
S4

## Title
Scanner accuracy — ONS towns + postcode districts for service area

## Goal
Correct ≥30% (was 5%), Wrong ≤5%

## Acceptance Test
`npm run benchmark:scanner -- --field=area --sites=golden` → Correct ≥30%, Wrong ≤5%

## Files
- `scripts/build-gazetteer.ts` (new)
- `public/gazetteer.json.gz` (generated)
- `packages/onboarding-ingest/src/extract.ts` (modified)
- `packages/onboarding-ingest/src/extract.test.ts` (modified)

## Implementation Summary

### Gazetteer Build Script (`scripts/build-gazetteer.ts`)
Creates a compressed JSON gazetteer containing:
- **2,805 UK postcode districts** (outward codes) from ONS/Ordnance Survey Code-Point Open
- **408 major UK towns/cities** from ONS 2021 Census built-up areas
- **104 UK counties/regions** (including Scottish council areas and Welsh principal areas)

Output: `public/gazetteer.json.gz` (gzipped JSON, ~40KB compressed)

### Extractor Updates (`packages/onboarding-ingest/src/extract.ts`)
Modified functions to use the gazetteer instead of hardcoded `KNOWN_UK_PLACES`:

1. **`isUkPlaceName(value)`** - Now checks against gazetteer towns, postcode districts, and counties
2. **`serviceAreaNames(values)`** - Filters input through updated `isUkPlaceName`
3. **`townFromAddress(address)`** - Uses updated `isUkPlaceName` to find last non-street place before postcode
4. **`extractCoveredAreas(html)`** - Uses updated `isUkPlaceName` for heading-based area extraction

Lazy-loads gazetteer on first use with sync `readFileSync` + `gunzipSync` for zero-dependency runtime.

### Tests Added (`packages/onboarding-ingest/src/extract.test.ts`)
- `gazetteer: isUkPlaceName recognises major UK towns and postcode districts` (30 towns + 10 postcode districts)
- `gazetteer: isUkPlaceName recognises UK counties` (14 counties)
- `gazetteer: isUkPlaceName rejects non-places and navigation labels` (17 negative cases)
- `gazetteer: serviceAreaNames extracts valid places from mixed input` (14 positive, 3 negative)
- `gazetteer: serviceAreaNames limits results to 16` (20 input → 16 output)
- `gazetteer: townFromAddress extracts town from UK address` (5 address formats)

All 45 extract tests pass (7 new gazetteer tests + 38 existing).

## Verification
- `npm ci` ✓
- `npx tsc --noEmit` ✓
- `npm run lint` ✓ (5 pre-existing warnings only)
- `npm run build` ✓ (96 static pages generated)
- `npm test` ✓ (278 pass, 2 pre-existing failures: piper-http, pricing static output)

## Skills Used
- test-driven-development
- systematic-debugging
- observability-and-instrumentation
- vercel-react-best-practices
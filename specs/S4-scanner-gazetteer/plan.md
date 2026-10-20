# S4 Implementation Plan

## Overview
Replace hardcoded UK place name list (`KNOWN_UK_PLACES` - 30 entries) with comprehensive ONS-based gazetteer containing 2,805 postcode districts, 408 towns, 104 counties.

## Steps

### 1. Create Gazetteer Build Script
- [x] Create `scripts/build-gazetteer.ts`
- [x] Include postcode districts from ONS/OS Code-Point Open
- [x] Include towns from ONS 2021 Census built-up areas
- [x] Include counties from UK administrative geography
- [x] Output gzipped JSON to `public/gazetteer.json.gz`
- [x] Run script to generate initial gazetteer

### 2. Update Extractor Functions
- [x] Add gazetteer loading utilities (`loadGazetteer`, `getGazetteerSync`, `initGazetteerSets`)
- [x] Update `isUkPlaceName` to use gazetteer sets
- [x] Verify `serviceAreaNames` works with updated `isUkPlaceName`
- [x] Verify `townFromAddress` works with updated `isUkPlaceName`
- [x] Verify `extractCoveredAreas` works with updated `isUkPlaceName`

### 3. Add Tests
- [x] Test `isUkPlaceName` with towns, postcode districts, counties
- [x] Test `isUkPlaceName` rejects non-places
- [x] Test `serviceAreaNames` extraction and limits
- [x] Test `townFromAddress` with various address formats

### 4. Verify Quality Gates
- [x] `npm ci`
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm test` (all extract tests pass)

## Dependencies
- S0 (self-hosted Inter font) - DONE, merged

## Risks
- Gazetteer file must be deployed to scanner droplet (D1 deploy note)
- Runtime file I/O on first call - cached after first load
- No network dependency at runtime (file is bundled in public/)

## Acceptance Criteria
- `isUkPlaceName` recognises 408 towns, 2805 postcode districts, 104 counties
- `serviceAreaNames` filters mixed input correctly
- `townFromAddress` extracts town from UK addresses
- All existing extract tests continue to pass
- Build and lint pass
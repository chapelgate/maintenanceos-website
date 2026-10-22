# Plan: F5 Visible-HTML Extraction Fix

## Scope
- One fix, one branch, one PR
- Scanner endpoint stays `/api/website/scan`
- Never weaken a check, test or threshold

## Implementation Steps

### 1. Code Discovery (Completed)
- Scanner extraction lives in `packages/onboarding-ingest/src/extract.ts` and `scan.ts`
- Entry point: `runScan` in `scan.ts` → `extractDraftFromHtml` in `extract.ts`

### 2. Extractors (Completed)
- `extractVisiblePhones(html: string): string[]` - tel: anchors + visible text regex
- `extractVisibleEmails(html: string): string[]` - mailto: anchors + visible text regex with rejection list
- Enhanced `extractServicesFromNav` as fallback when JSON-LD absent
- `fetchContactPage` in scan.ts for same-origin contact/about page fetch

### 3. Integration (Completed)
- `extractDraftFromHtml` calls new extractors after schema extraction
- Prefers schema (jsonld/microdata) over visible HTML
- Contact page fetch triggered when pages exist and budget remains

### 4. Tests (Completed)
- 8 new unit tests in `extract.test.ts`
- New fixture `visible-html-extraction.html`
- All 628 tests pass

### 5. Verification (Completed)
- `npm ci` - passes
- `npx tsc --noEmit` - passes
- `npm run lint` - passes (5 pre-existing warnings)
- `npm test` - 628/628 pass
- `npm run build` - passes

## Risk Mitigation
- No new network calls beyond one same-origin contact page
- SSRF guards unchanged (same `allowPublicHttpsUrl`, `sameRegistrableSite`, robots.txt)
- Timeout/budget guards unchanged
- Rejection logic for placeholder phones, noreply/webmaster/tracking emails
- No secrets printed or moved
- No new services, no DNS changes

## Rollout
- Branch: `fix/f5-visible-html-extraction`
- One PR to `origin/main`
- Estate-gate will validate spec artefacts exist
- Merge council gates merges
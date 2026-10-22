# F5 Visible-HTML Extraction Fix

## Summary
Scanner field extraction behind POST /api/website/scan now falls back to visible HTML when JSON-LD schema is absent. Adds extraction from tel: and mailto: links, header/footer text, UK phone/email patterns with validation, opening-hours text, services from nav/headings, and one same-origin contact/about page fetch inside existing SSRF guards and timeouts.

## Acceptance Criteria
- Phone extraction: on sites visibly showing a phone number, at least 80% extracted correctly
- Email extraction: on sites visibly showing an email, at least 80% extracted correctly  
- No regressions on name/address fields
- Unit tests with fixture HTML for each extractor
- Local `npm ci && npx tsc --noEmit && npm run lint && npm test && npm run build` pass

## Files Changed
- `packages/onboarding-ingest/src/extract.ts` - Added `extractVisiblePhones`, `extractVisibleEmails`, enhanced services extraction
- `packages/onboarding-ingest/src/scan.ts` - Added `fetchContactPage` for same-origin contact/about page fetch
- `packages/onboarding-ingest/src/extract.test.ts` - Added 8 new unit tests
- `packages/onboarding-ingest/src/fixtures/visible-html-extraction.html` - New test fixture

## Root Cause
Scanner relied heavily on JSON-LD schema (Organization/WebSite/ContactPoint/LocalBusiness). Most UK business sites lack structured data for phone, email, hours, services. Live scan on 30 sites got phone 1/30, email 1/30, hours 4/30, services 6/30 correct.

## Solution
Prefer schema data when present; fall back to visible HTML extraction:
1. `extractVisiblePhones` - tel: anchors + regex on visible text, normalized to E.164, rejects placeholders
2. `extractVisibleEmails` - mailto: anchors + regex on visible text, rejects noreply/webmaster/tracking/image filenames
3. Services fallback - `extractServicesFromNav` when JSON-LD/microdata/grounded services absent
4. Contact page fetch - one same-origin fetch of /contact, /contact-us, /get-in-touch, /find-us, /about, /about-us inside SSRF guards
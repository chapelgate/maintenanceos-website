# S5: Scanner accuracy — strict FAQ extraction

## Problem
The scanner's FAQ extraction was too permissive, matching button/div pairs that aren't FAQ accordions (mobile menus, dropdowns, tab panels). This caused false positives and low accuracy (13% correct, 40% wrong).

## Solution
Restrict `extractDetailsFaqs` to only extract FAQs from:
1. JSON-LD FAQPage schema (already strict)
2. Properly linked accordion pairs: `<button aria-expanded aria-controls="id">` + `<div id="id">` where button text contains a question mark
3. Native `<details>`/`<summary>` elements (already semantic)

Require ≥3 valid pairs for accordion extraction.

## Acceptance Criteria
- `npm run benchmark:scanner -- --field=faqs --sites=golden` → Correct ≥50%, Wrong ≤5%
- Mobile menus with button[aria-expanded] + div are NOT extracted as FAQs
- Proper FAQ accordions with aria-controls/id linkage and question marks ARE extracted
- Existing tests pass

## Files Changed
- `packages/onboarding-ingest/src/extract.ts` — modify `extractDetailsFaqs`
- `packages/onboarding-ingest/src/extract.test.ts` — add tests for mobile menu rejection and proper FAQ extraction
# Spec: mw-310 heading hierarchy honesty guard for accessibility page

## Problem
The accessibility page must not claim WCAG 2.2 AA conformance that has not been verified. HEADING_HONESTY: heading structure must use a single h1 (PageHero), sequential h2 sections, no h3-h6 IDs, and no WCAG 2.2 AA verified wording on unmeasured pages.

## Scope
Add `scripts/heading-hierarchy-honesty.test.mjs` asserting:
- accessibility page uses sequential h2 headings
- PageHero provides the single h1
- no h3-h6 heading IDs
- no "WCAG 2.2 AA verified" wording
- publicLaunch remains false

## Out of scope
No build/layout changes; no CSS; no WCAG 2.2 AA claim addition.

## Acceptance
- npm test includes heading-hierarchy-honesty.test.mjs and passes
- lint 0 errors, tsc clean, build green
- publicLaunch stays false
- no frozen paths touched

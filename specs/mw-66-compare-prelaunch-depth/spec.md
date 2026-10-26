# mw-66-compare-prelaunch-depth

## Problem
Compare index disclaimer did not explicitly say pre-launch comparisons are informational only and not an offer to sell. MDX pages already say pre-launch but need a lock so WorkSmartOS is never marked generally available.

## Acceptance
- Compare index disclaimer starts with "Pre-launch. Informational purposes only — not an offer to sell".
- Every compare MDX keeps Availability as "Pre-launch, early access only" for WorkSmartOS and denies commercial GA.
- `node --test scripts/compare-prelaunch-depth.test.mjs` exits 0.

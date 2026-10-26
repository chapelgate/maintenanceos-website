# mw-62-features-live-today-honesty

## Problem
"What's live today" on /features and home can be read as commercial GA or a public phone service.

## Acceptance
- Keep the existing "What's live today" heading (public-copy limit).
- Features and CommercialProof state pre-launch / not commercial general availability and not a public always-on phone service.
- `node --test scripts/features-live-today-honesty.test.mjs scripts/public-copy.test.mjs` exits 0.

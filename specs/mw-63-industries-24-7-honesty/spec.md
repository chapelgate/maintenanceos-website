# mw-63-industries-24-7-honesty

## Problem
Landlords industry `sub` said "Capture tenant repair calls 24/7", which reads as a live always-on phone service.

## Acceptance
- No industry role `sub` field claims 24/7 or always-on capture.
- Industries keep the explicit denial that voice intake is not a live always-on phone / 24/7 call centre.
- `node --test scripts/industries-24-7-honesty.test.mjs scripts/industries-copy.test.mjs` exits 0.

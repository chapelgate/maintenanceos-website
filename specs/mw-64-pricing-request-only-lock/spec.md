# mw-64-pricing-request-only-lock

## Problem
Pre-launch pricing must stay request-only: no published £ list, no self-serve checkout, and no tiers while publicLaunch is false.

## Acceptance
- `NEXT_PUBLIC_PUBLIC_LAUNCH` defaults false.
- Prelaunch card is "Request pricing" with no published price list / no self-serve checkout / not generally available.
- `getPricingConfig` returns `showTiers: false` and empty tiers in prelaunch.
- `node --test scripts/pricing-request-only-lock.test.mjs scripts/pricing-placeholder.test.mjs` exits 0.

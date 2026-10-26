# mw-59-home-cta-not-booking

## Problem
The homepage primary CTA says "Request an early demo" without stating that it is not a booking, checkout, or sale.

## Acceptance
- Homepage keeps primaryLabel "Request an early demo" linking to /demo/.
- Nearby copy states the request is an interest note, not a booking, checkout, or sale.
- No buy now, £, book a call, or launch-flag wording is introduced.
- `node --test scripts/home-cta-not-booking.test.mjs` exits 0.

# mw-54-demo-buyer-clarity

## Problem
`src/app/demo/page.tsx` describes a scripted preview but does not state that it is not for sale and not a booking.

## Acceptance
- The demo page states not an offer for sale, not a booking, and pre-launch synthetic demo.
- It keeps the live-telephone and live-number denials.
- It does not contain buy now, £, or live phone number claims.
- `node --test scripts/demo-buyer-clarity.test.mjs scripts/demo-call-honesty.test.mjs` exits 0.

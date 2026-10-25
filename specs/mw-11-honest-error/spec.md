# mw-11-honest-error

## Problem

The site has no `error.tsx` or `global-error.tsx`. A failed page falls through to the framework screen and can surface an internal message.

## Cause

No app-router error boundary was added for the static export.

## Acceptance

- `src/app/error.tsx` and `src/app/global-error.tsx` say the page did not finish and that the site is a pre-launch synthetic demo.
- They say nothing was sold, booked, or connected, and they do not publish a price or assign a live phone number.
- They do not render `error.message` or `error.digest`.
- The route error links home and contact. The global error sets `lang="en-GB"` and includes `html` and `body`.
- `node --test scripts/honest-error.test.mjs` exits 0.

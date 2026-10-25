# mw-08-honest-not-found

## Problem

The site has no `src/app/not-found.tsx`. An unknown address falls through to the framework default and does not say this is a pre-launch WorkSmartOS demo.

## Cause

No app-router not-found page was added for the static export.

## Acceptance

- `src/app/not-found.tsx` says the address is not a published page and that the site is a pre-launch synthetic demo.
- It says the page does not publish a price, assign a live phone number, connect a calendar, or deliver chat.
- It links to `/`, `/demo/`, and `/contact/`.
- It does not say buy now, show a pound price, or mention `NEXT_PUBLIC_PUBLIC_LAUNCH`.
- `node --test scripts/honest-not-found.test.mjs` exits 0.

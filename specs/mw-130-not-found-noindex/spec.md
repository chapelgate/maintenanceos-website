# mw-130-not-found-noindex

## Goal
Make the 404 page explicitly noindex and lock its pre-launch honesty copy so missing routes cannot look like a live product surface.

## Acceptance
- src/app/not-found.tsx exports robots index/follow false.
- node --test scripts/not-found-honesty.test.mjs passes.
- Page continues to deny price, live phone, calendar, and chat.

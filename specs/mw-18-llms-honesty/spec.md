# mw-18-llms-honesty

## Problem

`public/llms.txt` is the claims-safe summary for answer engines, but nothing fails the build if it starts selling, certifying WCAG, or implying a live phone.

## Cause

The file was maintained by review only.

## Acceptance

- `scripts/llms-honesty.test.mjs` locks pre-launch, no live phone, ReceptionistOS coming soon, and refuses price, WCAG verification, Google Analytics certification, and uptime claims.
- The same test locks `/dashboard/` and `/api/` as disallowed in `robots.ts`.
- `node --test scripts/llms-honesty.test.mjs` exits 0.

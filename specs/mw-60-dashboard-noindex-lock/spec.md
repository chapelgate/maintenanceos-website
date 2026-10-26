# mw-60-dashboard-noindex-lock

## Problem
The customer dashboard route is SAMPLE/DEMO and noindex, but nothing dedicated locks that honesty against regression.

## Acceptance
- `/dashboard` metadata sets `robots: { index: false, follow: false }`.
- Page states it is not a live customer portal and SAMPLE/DEMO rows are not production KPIs.
- No buy-now, £, or launch-flag wording is introduced.
- `node --test scripts/dashboard-noindex-lock.test.mjs` exits 0.

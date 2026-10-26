# mw-65-noindex-sitemap-lock

## Problem
Pre-launch demo/support surfaces (/dashboard, /status, /buyers) must stay out of the public sitemap and search indexes.

## Acceptance
- Those pages keep `robots: { index: false, follow: false }`.
- `marketingPaths` and sitemap path map omit them.
- `robots.ts` disallows `/dashboard/`, `/status/`, and `/buyers/`.
- `node --test scripts/noindex-sitemap-lock.test.mjs` exits 0.

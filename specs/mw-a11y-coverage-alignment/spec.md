# S: Inter font preload false for WebKit axe honesty

## Problem
The `next/font/local` config for Inter font has `preload: true` which causes WebKit to fetch the same woff2 font file twice at build time, violating the honesty gate requirement for mw-152 and inflating network waterfall.

## Solution
Change `preload: true` to `preload: false` in the localFont configuration in `src/app/layout.tsx`, so WebKit fetches the font once. This aligns with the WebKit axe honesty test that asserts `preload: false` avoids duplicate woff2 fetches.

## Acceptance Criteria
- `npm run build` exits 0 (103 pages)
- `grep -r "fonts.googleapis.com" .next/` returns nothing
- Font preload test passes: `node scripts/font-preload.test.mjs` → PASS
- No frozen paths touched; `publicLaunch` remains false

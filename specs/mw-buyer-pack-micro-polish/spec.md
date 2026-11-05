# S: buyer pack micro-polish — synthetic demo data disclosure + font preload fix

## Problem
The /buyers/ page previously used demo data that could be mistaken for live customer records. Additionally, the Inter font localFont config had `preload: true` causing WebKit to fetch the same woff2 twice, violating the mw-152 honesty gate.

## Solution
1. Add demo-data-is-synthetic disclosure section to /buyers/ page confirming all names/addresses/phone/case details are synthetic (no live customer records, no production evidence).
2. Change `preload: true` to `preload: false` in localFont config to avoid duplicate woff2 fetch in WebKit.

## Acceptance Criteria
- /buyers/ page clearly labels all demo data as synthetic
- Font preload test passes: `node scripts/font-preload.test.mjs` → PASS
- `npm run build` exits 0
- No frozen paths touched; `publicLaunch` remains false

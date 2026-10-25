# Assessment

## Defect
`npm test` fails `scripts/font-preload.test.mjs`: Inter `localFont` in `src/app/layout.tsx` sets `preload: true`.

## Cause
Commit a1a873d (F1: Update localFont preload to true) reversed #286, which set `preload: false` so WebKit does not download the same woff2 twice. The lock test was left expecting `preload: false`.

## Impact
Clean checkout `npm test` is red (324 pass, 1 fail). WebKit can fetch Inter twice.

## Fix choice
Restore `preload: false`. Do not weaken the lock test.

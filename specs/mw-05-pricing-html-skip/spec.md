# mw-05-pricing-html-skip

## Problem

scripts/pricing-copy.test.mjs fails clean checkout npm test with ENOENT when out/pricing/index.html was never built.

## Cause

The static-output h1 test always opened out/pricing/index.html instead of skipping when the export is absent.

## Acceptance

- Test exits 0 when out/pricing/index.html is absent.
- When the file exists, it still asserts an h1 whose text is Pricing.
- Source assertions in the same file stay unchanged.

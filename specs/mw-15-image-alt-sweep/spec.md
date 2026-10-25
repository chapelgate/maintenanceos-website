# mw-15-image-alt-sweep

## Problem

No automated check fails when a rendered `<img>` under `src/` omits `alt` or uses an empty literal.

## Cause

Alt text was only spot-checked by review.

## Acceptance

- `scripts/image-alt-sweep.test.mjs` walks every non-test `.tsx` under `src/` and asserts each `<img>` has a non-empty `alt` (JSX expression or non-empty literal).
- HomePhoto and CaseStudyCard keep `alt={...}` on their `<img>` elements.
- `node --test scripts/image-alt-sweep.test.mjs` exits 0.

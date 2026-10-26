# mw-58-skip-link-all-layouts

## Problem
`scripts/skip-link-lock.test.mjs` only checked the root layout, so a nested layout could drop landmarks unnoticed.

## Acceptance
- Root layout still renders SkipLink and `<main id="main">`.
- Every `src/app/**/layout.tsx` is scanned; nested layouts must not add a second main without `id="main"`.
- No WCAG 2.2 AA verified claim is introduced.
- `node --test scripts/skip-link-lock.test.mjs` exits 0.

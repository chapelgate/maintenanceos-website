# mw-17-skip-link-lock

## Problem

Nothing fails the build if the skip link or the `main` landmark it targets is removed from the root layout.

## Cause

The skip link existed, but it was not locked by a source test.

## Acceptance

- `scripts/skip-link-lock.test.mjs` asserts `SkipLink` points at `#main`, the root layout renders `SkipLink`, and `<main id="main">` remains.
- The test refuses a WCAG 2.2 AA verification claim in those files.
- `node --test scripts/skip-link-lock.test.mjs` exits 0.

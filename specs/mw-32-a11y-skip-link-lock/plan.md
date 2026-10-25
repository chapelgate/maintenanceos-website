# Plan

1. Expand `pages` array in `tests/webkit-a11y/a11y.test.mjs` to include all public routes.
2. Extend `scripts/skip-link-lock.test.mjs` to scan all `src/app/**/layout.tsx` for `<SkipLink />` and `<main id="main">`.
3. Run npm test to verify.
4. Open draft PR with Estate-* headers.

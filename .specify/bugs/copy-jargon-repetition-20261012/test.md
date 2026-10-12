# Test

`scripts/public-copy.test.mjs` forbids the internal labels in rendered source, keeps the full safety model and the full path strip on one page each, keeps "Core safety controls are built" once, and allows "What's live today" at most once per page.

`npm test` (263 + 454), eslint, and `tsc --noEmit` passed.

Verdict: verified locally before merge.

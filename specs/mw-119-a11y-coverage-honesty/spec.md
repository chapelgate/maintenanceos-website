# mw-119-a11y-coverage-honesty

## Goal
Align accessibility coverage copy with the current WebKit axe matrix so gated index routes are not listed as uncovered (REVIEW item 6).

## Acceptance
- Page lists current WebKit-gated index routes.
- Nested/dynamic routes called out as not covered.
- node --test scripts/a11y-coverage-honesty.test.mjs passes.

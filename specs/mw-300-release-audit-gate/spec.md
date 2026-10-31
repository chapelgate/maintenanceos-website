# mw-300: release preflight dependency audit gate

## Summary
Make `release:preflight` fail closed on actionable dependency advisories by running `audit:ci` before lint/test/build.

## Requirements
- `scripts/release-preflight.mjs` runs `npm run audit:ci` before eslint
- `scripts/release-control.test.mjs` locks that call in place
- Frozen paths untouched

## Acceptance Criteria
- release-control tests pass
- `npm test` exit 0

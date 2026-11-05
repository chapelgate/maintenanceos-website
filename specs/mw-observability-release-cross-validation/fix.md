# mw-observability-release-cross-validation fix

## Change
Added `scripts/observability-release-cross-validation.test.mjs` with 5 tests for full cross-validation between public/release.json, out/release.json, public/status.json, and health artifact. Required fields presence and values, commit SHA consistency, denial consistency, health artifact validation. Specs/build-readiness.md committed alongside.

## Tests
5/5 pass locally. Lint clean. Typecheck clean. Build green.

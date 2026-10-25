# mw-16-validate-fixture-skip

## Problem

Editing only a captured HTML fixture under `packages/onboarding-ingest/src/fixtures/` starts the hosted "Website integration repair validation" job. That job asks for `ubuntu-latest`, dies in about two seconds with no steps, and blocks honest draft merges.

## Cause

The workflow path filter matched every file under `packages/onboarding-ingest/**`, including fixtures that do not change the scanner runtime image.

## Acceptance

- The pull_request path filter excludes `packages/onboarding-ingest/src/fixtures/**`.
- The scanner image smoke step also skips when the only onboarding-ingest paths in the diff are under `src/fixtures/`.
- `node --test scripts/validate-fixture-skip.test.mjs` exits 0.
- No Docker group change. No hosted spend.

# mw-12-secret-scan

## Problem

A captured third-party homepage fixture stored a Google client key, and the repo had no test that fails when a common live secret pattern is committed.

## Cause

The onboarding fixture was saved as raw public HTML, and the secret check lived only in a backlog note.

## Acceptance

- `packages/onboarding-ingest/src/fixtures/croftautomotive-home.html` replaces that client key with `REDACTED_FIXTURE_GOOGLE_API`.
- `scripts/secret-pattern-scan.test.mjs` walks the tracked tree, skips dependencies and build output, and fails on common live key or private-key patterns.
- `node --test scripts/secret-pattern-scan.test.mjs` exits 0.
- The onboarding extract test that reads the fixture still exits 0.

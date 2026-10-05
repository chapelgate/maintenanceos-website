# Fix

Change one line only in `packages/onboarding-ingest/project.yml`:

- from `main: bundle.cjs`
- to `main: main`

Reason: DigitalOcean Functions `main` names the exported handler. The existing `bundle.cjs` already exports `main`; the bundle itself is not being replaced.

Rollback: revert this PR. No Scanner runtime, networking, telephony, queue, database or service change is part of this fix.

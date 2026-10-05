# Fix

Replace the obsolete Railway Scanner V2 fallback URL with the already-proven DigitalOcean Scanner V2 HTTPS URL in exactly two synchronized files:

- `packages/onboarding-ingest/packages/website/scan/index.ts`
- `packages/onboarding-ingest/packages/website/scan/bundle.cjs`

No application logic, Function route, infrastructure or telephony change.

Rollback: revert this PR; the pre-change Function fallback remains the prior rollback point.

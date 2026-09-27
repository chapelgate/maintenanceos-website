# Continuation Step 13 — conversion path acceptance

**Date:** 2026-09-27
**Owner:** Conversion + Forms + Website Manager
**Baseline:** Step 12 commit `3603619ddd78427e33a795902af549b82353c808`

## Path under acceptance

Visitor → trust/content → **Create from website** / demo / contact →
shared lead adapter → existing Railway control plane → durable follow-up path.

## Verification

Focused conversion/lead regressions: **9/9 PASS**.

`npm run conversion:acceptance`:

- canonical primary CTA remains `/create/`;
- shared short lead form and `/create` submission still use the common adapter;
- production endpoint remains the existing RSFM Railway control plane;
- `/ready` returned **200** with durable Postgres readiness;
- CORS preflight passed for both public website-lead and website-event endpoints
  using the current website origin;
- **no production POST was performed**.

`npm run functional:smoke`:

- 26 sitemap routes checked;
- local valid/invalid/honeypot lead contract checked;
- 0 failures.

The existing original Step-6 live lead-delivery proof remains the durable evidence
that the endpoint can store/notify. This continuation deliberately avoids creating
a duplicate real lead merely to re-prove an unchanged delivery path.

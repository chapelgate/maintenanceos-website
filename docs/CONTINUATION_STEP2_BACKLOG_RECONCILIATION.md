# Continuation Step 2 — backlog reconciliation

**Date:** 2026-09-26
**Owner:** MOS Website Manager
**Scope:** status/documentation truth only; no telephony or new infrastructure
**Status:** release candidate

## Goal

Make the repository describe the website that actually exists now. The rule is
one backlog, explicit launch gates, and no stale deployment instructions.

## Reconciled status

The original top-level backlog had stale TODO/PARTIAL labels even though later
programme evidence had already closed the underlying work. Those rows are now
aligned to the evidence already in this repository.

Closed or clarified:
- positioning/value proposition;
- brand baseline;
- information architecture baseline;
- UI/component baseline;
- claims-gated copy baseline;
- industry routes;
- automated release-test baseline;
- handoff/source-of-truth coverage.

Split instead of falsely closing:
- current Product Investigator baseline vs **product evidence refresh**;
- legal-page engineering vs **counsel review**;
- automated accessibility baseline vs **manual/assistive QA**;
- security baseline vs **HTTP response-header/clickjacking launch risk**;
- proven mobile journey vs **broader cross-browser/manual QA**.

Red-team staging remains open.

## Documentation drift repaired

- `WEBSITE_ARCHITECTURE.md` no longer says the production lead path is undecided.
- `WEBSITE_LAUNCH_CHECKLIST.md` now distinguishes completed engineering from
  human/launch gates.
- `CURSOR_HANDOFF.md` is restored as a thin pointer to canonical state rather
  than a second task list.
- `WEBSITE_SECURITY_REVIEW.md` now rolls up the real static-host security
  posture and the known response-header gap.
- obsolete README references to parallel/missing programme state are replaced by
  current canonical documents.
- sandbox/calendar/dashboard deployment docs no longer instruct operators to
  create Render services. Current policy is DigitalOcean-only when a companion
  is explicitly authorised.
- `.env.example` now matches that policy.
- Fonio readiness language now treats optional companion enablement, legal
  review and frozen telephony as launch/enablement dependencies rather than
  current code blockers.
- current Next 16 performance budgets replace stale 110 KB wording in the
  readiness note.

## Security evidence captured during reconciliation

- `npm audit --audit-level=moderate`: 0 known vulnerabilities.
- tracked-source common secret-pattern scan: no matching API/private-key pattern.
- known static-host HTTP response-header/clickjacking gap remains visible and
  unresolved; it was not hidden or worked around with fake headers.

## New drift regression

`scripts/backlog-reconciliation.test.mjs` prevents the key status boundaries
from silently drifting back:
- one backlog;
- launch gates stay open where human/manual work is genuinely required;
- security gap remains explicit;
- handoff keeps the Website Manager loop;
- companion docs cannot regress to Render deployment instructions;
- architecture cannot regress to an undecided lead endpoint.

## No scope expansion

No hosting resource, runner, database, credential, paid service, voice path,
analytics vendor, or telephony integration is created by this step.

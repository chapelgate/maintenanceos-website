# Third-party licence evidence for MaintenanceOS website

## Problem

The draft PR #346 binds licence evidence (docs/THIRD_PARTY_RELEASE_EVIDENCE.md and scripts/licence-evidence.test.mjs) to 474 lock rows at commit c4ff3ca with package-lock.json SHA-256 f6305aad..., but Chapelgate Estate Gate sendbacks because the PR body lacks Estate-Preflight/Routing/Artifact/Converged headers. There is no Spec Kit FEATURE artifact tracing what the evidence covers, why each group applies or not, or the unresolved-obligation boundary.

## Cause

Missing FEATURE Spec Kit artefacts (spec/plan/tasks/build-readiness) under specs/mw-1023-01-licences/, plus missing Estate-* PR-body headers for the council's pre-launch estate gate.

## Acceptance

- docs/THIRD_PARTY_RELEASE_EVIDENCE.md unchanged: 474/474 lock rows bound, LGPL/MPL/ISC recorded unresolved (not cleared), no legal decision made.
- scripts/licence-evidence.test.mjs unchanged: 3 named tests pass, fail closed on unresolved obligations.
- New specs/mw-1023-01-licences/ with spec.md, plan.md, tasks.md (every task checked), build-readiness.md groups 1-8 each with Status: APPLIES|NOT_APPLICABLE|ALREADY_COVERED and Reason: >= 10 chars.
- PR #346 body starts with Estate-Preflight: yes / Estate-Route: FEATURE / Estate-Artifact: specs/mw-1023-01-licences / Estate-Converged: yes (literal lines, not bold, not fenced).
- node --test scripts/licence-evidence.test.mjs still 3 pass / 0 fail.
- estate-gate success on PR #346.

## Mirrored from

specs/enquiry-mailto-fallback/ (completed Spec Kit FEATURE slice) structure.

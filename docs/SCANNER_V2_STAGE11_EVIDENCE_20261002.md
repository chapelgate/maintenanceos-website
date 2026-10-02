# Scanner V2 Stage 11 — UI and Operational State Evidence

Status: COMPLETE / VERIFIED
Date: 2026-10-02
Baseline: Scanner V2 Stage 10 merge `bdf22a59138b7fa002bd2e01ebf4b2c8c7a115e0`
Verified candidate: `51050ff4e4e031253043686e371277daaa9dc498`

## Implemented

- Added a single typed Scanner V2 operational-state projection.
- Exposes all required states:
  - Discovering;
  - Crawling X/Y;
  - Indexing;
  - Complete;
  - Partial;
  - Failed.
- Derives discovered/fetched/queued/unresolved/skipped counts from URL rows rather than trusting potentially stale aggregate counters.
- COMPLETE fails closed to PARTIAL if queued or unresolved URLs still exist.
- `fullyLearned` is true only for a clean COMPLETE corpus with zero queued and zero unresolved pages.
- Exposes a last-scan timestamp from the durable job, falling back to the latest URL activity timestamp.
- Adds a bounded source viewer: first 50 URL dispositions while retaining the exact total source count.
- Adds an accessible Scanner V2 status component with labelled state, counts, last scan and optional crawl-source details.
- PARTIAL explicitly tells the operator the receptionist must not be presented as having learned the whole site.
- The component is additive and optional in `/create`; Scanner V2 is still not routed into production onboarding in Stage 11.

## Deterministic acceptance

GitHub Actions run `37070051494` / job `111047123363`: PASS.

- Stage 11 targeted status + worker + refresh tests: PASS.
- Full repository regression: 419/419 PASS.
- Accessibility: 17/17 PASS.
- TypeScript: PASS.
- Production Next.js 16.3.8 build: PASS.
- Static export: 30/30 routes.
- `SCANNER_V2_STAGE11_UI_CONTRACT=PASS`.
- `PRODUCTION_SCANNER_AND_PHONE_SURFACE_UNCHANGED=PASS`.

Acceptance covers:
- exact labels for all six operational states;
- COMPLETE -> PARTIAL fail-closed downgrade when queued/unresolved work remains;
- fully-learned state only for clean COMPLETE;
- recomputation from URL rows rather than stale counters;
- durable-job updatedAt precedence and safe timestamp fallback;
- bounded/sorted source preview with exact source total;
- explicit accessible Partial/Failed messaging;
- no production Scanner V1, sandbox-call, provisioning-gateway or telephony-surface changes.

## Independent NVIDIA review

Evolution Engine run `37070235841` / job `111047718072`: PASS.

- `nvidia-gpt-oss`: REVIEW PASS.
- `nvidia-nemotron`: REVIEW PASS.
- Included/free NVIDIA development capacity.
- Marginal cost USD 0.
- Both calls were live provider executions.
- NVIDIA was used for public reasoning/review only, not unproven toolful code execution.
- Review workflow proved `git diff --exit-code` after model execution.

## Release boundary

Stage 11 remains additive. Scanner V2 is still not routed into the production `/create` scanner path. Scanner V1 remains the current production/rollback path until Stage 12 canary acceptance succeeds.

Next boundary: Stage 12 production canary and freeze.

## Golden phone line invariant

No MaintenanceOS production telephony, carrier routing, live phone number, provider credential, production voice runtime or golden phone line was modified, exercised, rerouted, restarted or redeployed.

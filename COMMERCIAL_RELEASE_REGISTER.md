# MaintenanceOS Commercial Release Register

**Created:** 2026-10-05  
**Programme:** MaintenanceOS Commercial Release Hardening  
**Execution authority:** Chapelgate Control Room task ledger / existing atomic allocator  
**Canonical product source:** `chapelgate/maintenanceos-v1-pilot` `main`  
**Website source:** `chapelgate/maintenanceos-website` `main`

## Purpose

This is the durable release register for moving MaintenanceOS from validated pilot software to commercial release. It is a status/index document, **not a second execution queue**.

The Control Room task ledger is the executable authority for the parallel work below. `AUTONOMOUS_WORK_SLICES.md` remains the narrow controlled-call worker queue and is not replaced by this register.

## Expert design lenses

The slicing was challenged from these independent professional perspectives:

- SaaS/product release engineering;
- UK housing-maintenance operations and Awaab's Law;
- AI/voice reliability and telephony;
- application security and independent assurance;
- UK GDPR/DPA/DUAA privacy and data governance;
- SaaS procurement/contracts and supplier assurance;
- IP/trademark/brand clearance.

Rules: evidence over opinion; authoritative sources for legal requirements; no invented legal conclusions; zero-code/reuse first; no new service/queue/database/router/scheduler/model-router/control plane; no golden-line mutation outside the existing explicit gate.

## Parallelism and collision rules

1. One task may be claimed by one worker only. The existing allocator/claims ledger enforces this.
2. A worker holds at most one active claim at a time.
3. Research/evidence slices own distinct output files under `docs/commercial_release/`.
4. CR-10/11/12 deliberately build isolated cores; they must not touch shared `api.py` or shared schema integration.
5. **CR-13 is the only commercial-release slice allowed to integrate the three accepted cores into shared application files.**
6. Human/professional gates are not executable worker work and cannot be marked complete from AI output.
7. No launch claim is allowed from source presence, unit tests, health checks or plans alone.

## Existing MaintenanceOS work retained

| Control Room task | Status | Role in this programme |
|---|---|---|
| #18 MaintenanceOS controlled pilot readiness | IN PROGRESS | Existing voice/pilot release path; retained |
| #676 Cloud-first MaintenanceOS acceptance pack | QUEUED | Existing deterministic acceptance evidence lane; retained |
| #685 MaintenanceOS rollback and recovery proof pack | QUEUED | Existing recovery-evidence lane; retained and moved to Cloud 3 |
| #681 MaintenanceOS acceptance evidence pack | BLOCKED / SUPERSEDED | Duplicate of #676; preserved for history, not executable |
| #687 Cloud lifecycle MaintenanceOS proof | BLOCKED / SUPERSEDED | Duplicate of #685; preserved for history, not executable |

## Wave A — immediately parallel and non-overlapping

| Key | Task | Control Room | Owner | Status | Exclusive output |
|---|---|---:|---|---|---|
| CR-01 | Brand clearance evidence pack | #715 | GitHub research bot | QUEUED | `docs/commercial_release/BRAND_CLEARANCE_EVIDENCE.md` |
| CR-02 | Provider rights/data-processing register | #716 | chapelgate-cloud-1 | QUEUED | `docs/commercial_release/PROVIDER_RIGHTS_REGISTER.md` |
| CR-03 | DPIA factual data-flow pack | #717 | chapelgate-cloud-2 | QUEUED | `docs/commercial_release/DPIA_FACT_PACK.md` |
| CR-04 | Awaab statutory requirements matrix | #718 | GitHub research bot | QUEUED | `docs/commercial_release/AWAAB_REQUIREMENTS_MATRIX.md` |
| CR-05 | Production identity gap/reuse plan | #719 | chapelgate-cloud-2 | QUEUED | `docs/commercial_release/IAM_GAP_AND_REUSE_PLAN.md` |
| CR-06 | Data lifecycle mechanics gap/reuse plan | #720 | chapelgate-cloud-3 | QUEUED | `docs/commercial_release/DATA_LIFECYCLE_GAP_AND_REUSE_PLAN.md` |
| CR-07 | Security + licence evidence baseline | #721 | chapelgate-cloud-3 | QUEUED | `docs/commercial_release/SECURITY_AND_LICENCE_BASELINE.md` |
| CR-08 | Public legal-page source closure inventory | #722 | chapelgate-cloud-1 | QUEUED | `docs/commercial_release/WEBSITE_LEGAL_SOURCE_GAPS.md` |
| CR-09 | Incident/observability acceptance matrix | #723 | chapelgate-cloud-2 | QUEUED | `docs/commercial_release/INCIDENT_OBSERVABILITY_MATRIX.md` |

These nine tasks have no release-programme dependency on one another and may run in parallel.

## Wave B — parallel isolated engineering cores

| Key | Task | Control Room | Dependency | Status boundary |
|---|---|---:|---|---|
| CR-10 | Awaab policy core + isolated tests | #724 | CR-03 + CR-04 | QUEUED but dependency-held |
| CR-11 | Data lifecycle core + isolated tests | #725 | CR-03 + CR-06 | QUEUED but dependency-held |
| CR-12 | Identity control core + isolated tests | #726 | CR-05 | QUEUED but dependency-held |

These may run in parallel **after** their evidence inputs close because their shared-file integration is explicitly excluded.

## Wave C — single shared integration

| Key | Task | Control Room | Dependency |
|---|---|---:|---|
| CR-13 | Integrate commercial release controls + full regressions | #727 | CR-10 + CR-11 + CR-12 |

Only this slice may wire the three cores into shared API/schema/readiness paths. This serialisation is intentional to prevent merge churn.

## Wave D — commercial assurance

| Key | Task | Control Room | Dependency |
|---|---|---:|---|
| CR-14 | Customer trust-pack factual schedules | #728 | CR-02 + CR-03 + CR-07 + CR-08 + CR-09 + existing #685 |
| CR-15 | Pen-test scope and release-candidate test plan | #729 | CR-07 + CR-13 + CR-14 |

CR-14 produces factual schedules only. Counsel owns legal wording/approval. CR-15 prepares authorised test scope only; it does not scan live systems.

## External / human gates

| Key | Gate | Control Room | Current status | Completion authority |
|---|---|---:|---|---|
| CR-H01 | LUMI result intake + exact candidate freeze | #732 | BLOCKED while existing LUMI programme runs | MaintenanceOS release owner after LUMI evidence |
| CR-H02 | Formal brand/trademark/passing-off decision | #733 | AWAITING APPROVAL | IP/trademark professional + Andrew |
| CR-H03 | Final launch legal pack approval | #734 | AWAITING APPROVAL | UK technology/data counsel + Andrew |
| CR-H04 | Independent penetration test + retest | #735 | AWAITING APPROVAL | Authorised independent tester + release owner |
| CR-H05 | Public commercial launch approval | #736 | AWAITING APPROVAL | Andrew |

Workers may prepare evidence for these gates but cannot self-approve them.

## Wave E — design-partner pilot

| Key | Task | Control Room | Dependency |
|---|---|---:|---|
| CR-16 | UK design-partner pilot evidence pack | #730 | CR-13 + CR-14 + CR-15 + existing #18 + #676 + CR-H01/H02/H03/H04 |

No real customer/resident onboarding occurs until every dependency is complete.

## Wave F — final release decision

| Key | Task | Control Room | Dependency |
|---|---|---:|---|
| CR-17 | Final commercial-release evidence audit | #731 | CR-16 |
| CR-H05 | Public launch approval | #736 | CR-17 + CR-H01/H02/H03/H04 |

The final audit must return **NOT READY** if any required evidence is missing. It does not toggle public launch.

## Status definitions

- **QUEUED** — available once dependencies are complete.
- **IN_PROGRESS** — claimed by exactly one worker.
- **BLOCKED** — cannot proceed automatically; blocker is recorded.
- **AWAITING_APPROVAL** — genuine human/professional authority required.
- **DONE** — substantive acceptance evidence passed.
- **SUPERSEDED** — historical task preserved but removed from eligibility to prevent duplicate work.

## Completion evidence standard

Every worker must return:
- exact repository/ref or source set used;
- files changed or report path;
- commands/tests run and results;
- source links for external legal/regulatory/provider facts;
- explicit unresolved blocker(s);
- no claim of production readiness from documentation alone.

## Release objective

Commercial release is reached only when:
1. the LUMI-selected candidate is frozen and reproducible;
2. controlled PSTN/pilot readiness is accepted;
3. Awaab/data-lifecycle/IAM controls are integrated and regression-green where applicable to launch market;
4. provider permissions, privacy/data flows, recovery, security and incident evidence are complete;
5. brand, counsel and independent security gates are closed;
6. the bounded UK design-partner pilot passes;
7. CR-17 returns evidence-backed READY; and
8. Andrew explicitly completes CR-H05.

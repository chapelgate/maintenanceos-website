# MaintenanceOS — Commercial Release Master Register

**Status:** ACTIVE — release hardening  
**Created:** 2026-10-05  
**Live source of truth:** Chapelgate AI Control Room task ledger (`project = MaintenanceOS Commercial Release`)  
**Purpose of this file:** stable human-readable release map. Workers update the Control Room task/evidence record, not this file, so parallel workers cannot overwrite one another's status.

## Execution rules

1. One task has one owner/claim at a time. The existing Control Room allocator is authoritative for claims and dependency release.
2. Parallel work is allowed only where dependencies are satisfied and task scopes do not share mutable files.
3. Workers must reproduce/prove a gap before repair and follow ZERO CODE -> REUSE -> CONFIGURE -> smallest reversible code.
4. No new queue, database, scheduler, router, supervisor, control plane, auth service, monitoring service, or second harness is authorised by this programme.
5. The golden MaintenanceOS phone line is not changed by any commercial-release slice unless a task explicitly requires a separately authorised controlled-call gate.
6. Legal/research workers produce factual evidence and drafts only. They cannot provide professional legal sign-off.
7. Production/public security testing needs explicit authorisation and an approved scope.
8. Completion requires objective evidence. A document, commit, build, or model answer alone is not acceptance unless the task says it is.
9. Shared-file integration is deliberately deferred to CR-13 so isolated workers do not collide.
10. Human gates do not block unrelated independent work.

## Existing MaintenanceOS work reused

| Control Room task | Purpose | Treatment |
|---|---|---|
| #18 | Controlled pilot readiness | Reused; remains part of pilot gate |
| #676 | Cloud-first acceptance pack | Reused; no duplicate acceptance task created |
| #685 | Rollback and recovery proof pack | Reused; feeds trust/recovery evidence |
| #692 | MaintenanceOS cloud offload acceptance | Already done; retained as evidence |
| #681 | Older acceptance evidence pack | Superseded/blocked to avoid duplicate work |
| #687 | Older rollback-readiness checklist | Superseded/blocked to avoid duplicate work |

## Commercial-release tasks

| ID | Control Room # | Work package | Owner/lane | Current gate | Depends on |
|---|---:|---|---|---|---|
| CR-01 | 715 | Brand clearance evidence pack | GitHub research | AVAILABLE | — |
| CR-04 | 718 | Awaab statutory requirements matrix | GitHub research | HELD in research lane | CR-01 |
| CR-02 | 716 | Provider rights & data-processing register | GitHub research | HELD in research lane | CR-04 |
| CR-03L | 737 | Local-model factual data inventory draft | Local Granite one-shot worker | **DONE** | — |
| CR-03 | 717 | DPIA factual data-flow pack | Cloud-2 / normal owner | AVAILABLE | CR-03L (done) |
| CR-05 | 719 | Production identity gap/reuse plan | Cloud-2 / normal owner | AVAILABLE | — |
| CR-06 | 720 | Data lifecycle gap/reuse plan | Cloud-3 / normal owner; NVIDIA later | AVAILABLE | — |
| CR-07 | 721 | Security & licence evidence baseline | Cloud-3 / normal owner; NVIDIA later | AVAILABLE | — |
| CR-08 | 722 | Website legal-source closure inventory | Cloud-1 / normal owner | AVAILABLE | — |
| CR-09 | 723 | Incident/observability acceptance matrix | Cloud-2 / normal owner | AVAILABLE | — |
| CR-10 | 724 | Awaab deterministic policy core + isolated tests | Antigravity | HELD | CR-03, CR-04 + live Antigravity route |
| CR-11 | 725 | Data-lifecycle core + isolated tests | NVIDIA Direct Worker | HELD | CR-03, CR-06 + project-scoped NVIDIA attachment |
| CR-12 | 726 | Identity-control core + isolated tests | Antigravity | HELD | CR-05 + live Antigravity route |
| CR-13 | 727 | Integrate release controls + full regression | MaintenanceOS Integration Worker | HELD — sole shared writer | CR-10, CR-11, CR-12 |
| CR-14 | 728 | Customer trust-pack factual schedules | Worker pool | HELD | CR-02,03,07,08,09 + #685 |
| CR-15 | 729 | Pen-test scope and RC test plan | GitHub research | HELD | CR-07, CR-13, CR-14 |
| CR-16 | 730 | UK design-partner pilot pack/execution | MaintenanceOS | HELD | CR-13,14,15 + #18,#676 + H01-H04 |
| CR-17 | 731 | Final commercial-release evidence audit | Overseer / independent non-Claude review | HELD | CR-16 |
| CR-H01 | 732 | LUMI result intake + exact candidate freeze | MaintenanceOS | BLOCKED on existing LUMI programme | Existing LUMI completion |
| CR-H02 | 733 | Formal brand/trademark clearance decision | Andrew / IP counsel | HUMAN GATE | CR-01 |
| CR-H03 | 734 | Counsel approval of launch legal pack | Andrew / UK tech-data counsel | HUMAN GATE | CR-14 |
| CR-H04 | 735 | Independent penetration test + retest | Independent tester | HUMAN GATE | CR-15 |
| CR-H05 | 736 | Public commercial launch approval | Andrew | FINAL HUMAN GATE | CR-17 + H01-H04 |

## Parallelisation design

### Wave A — available immediately
These touch separate evidence/doc scopes and may run concurrently:
- Research lane: CR-01 only; CR-04 then CR-02 unlock sequentially so the same research worker cannot duplicate/overlap itself.
- Normal lane O1: CR-08 website legal-source facts.
- Normal lane O2: CR-03 / CR-05 / CR-09 product data, identity and observability analysis. The allocator permits one claim per worker; additional normal workers may take these only if ownership is explicitly reassigned.
- Normal lane O3 / NVIDIA-prep: CR-06 / CR-07 lifecycle and security/licence analysis.
- CR-03L local-model factual structuring is already DONE and is evidence input to CR-03.
- Existing #676 and #685 may also continue because they are separate acceptance/recovery evidence work.

### Wave B — isolated implementation
Released only after its evidence dependencies pass:
- CR-10 owns the isolated Awaab policy core; it must not touch shared API/models.
- CR-11 owns the isolated lifecycle core; it must not touch shared API/schema integration.
- CR-12 owns the isolated identity contract; it must not create a password/auth service or touch shared API integration.

### Wave C — one shared integration owner
CR-13 is the only release slice allowed to integrate the accepted cores into shared application/API/model/migration/readiness files. This is the main duplicate-work/collision guard.

### Wave D — assurance
CR-14 trust pack and CR-15 penetration-test scope follow accepted technical evidence. Professional legal/security gates remain separate.

### Wave E — commercial proof
CR-16 is the bounded UK design-partner pilot. CR-17 is the final independent evidence audit. Public launch remains disabled until CR-H05.

## Commercial-release definition of done

MaintenanceOS is not generally commercially released until:
- LUMI winner/config is frozen and reproducible;
- controlled telephony acceptance is passed;
- applicable Awaab/social-housing controls are accepted for any social-housing launch;
- DPIA/data lifecycle/IAM/recovery/incident controls are evidenced;
- provider rights and transfer/data-use assumptions are verified;
- brand/IP decision is professionally cleared;
- customer/public legal documents are professionally approved;
- independent penetration test/retest is accepted;
- UK design-partner pilot meets its exit criteria;
- final evidence audit says READY; and
- Andrew approves the exact release candidate.

No missing evidence may be converted into an assumption.

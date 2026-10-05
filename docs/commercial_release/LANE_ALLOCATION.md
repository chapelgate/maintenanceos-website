# MaintenanceOS — Commercial Release Lane Allocation

Created: 2026-10-05  
Authoritative task state: Chapelgate AI Control Room, project `MaintenanceOS Commercial Release`  
Master task map: `docs/commercial_release/MASTER_RELEASE_REGISTER.md`

## Global execution rule

- **Claude is excluded from this programme.** No Claude subscription, Claude Code, Claude model fallback, or Claude reviewer may be selected.
- One Control Room task may have only one execution owner/claim at a time.
- One worker works one slice at a time.
- No two workers may edit the same shared MaintenanceOS application files concurrently.
- Research/legal facts require current authoritative sources; local/NVIDIA/Antigravity model output is never legal sign-off.
- Production/golden-line mutation remains separately gated.
- Reuse existing worker runtimes, queues and owner services. Do not add another queue, router, scheduler, supervisor, database, model router, or control plane.

## Worker types used

| Worker type | Best use | Release boundary |
|---|---|---|
| Normal project/owner worker | long-running repo analysis, evidence assembly, integration, pilot operations | one canonical project queue, persistent evidence, no independent legal sign-off |
| Direct Antigravity worker | tightly bounded exact-path engineering with deterministic tests | network disabled; no production, deploy or merge authority; exact writable paths only |
| Direct NVIDIA owner worker | isolated coding/review throughput on a dedicated checkout | one project/slice, deterministic tests, no production authority |
| GitHub research worker | current public-source research and evidence | source every claim; no legal conclusion or external commitment |
| Local Chapelgate model | offline summarisation/classification/draft assembly from supplied verified evidence | draft-only; never authority for current law/provider terms |

## Lane map

### LANE R — Current-source research
**Worker:** GitHub research bot  
**Brain/path:** connected web/GitHub research, no Claude  
**Write boundary:** research evidence documents only  
**Sequence:** CR-01 → CR-04 → CR-02 → CR-15 when dependencies open.

- CR-01 brand clearance evidence
- CR-04 Awaab statutory requirements
- CR-02 provider rights/data-processing register
- CR-15 penetration-test scope

Only one R-lane slice is claimed at once. These jobs require current sources, so they are not delegated to the local model or network-disabled Antigravity worker.

### LANE O — Normal MaintenanceOS owner
**Worker type:** normal persistent project/owner worker  
**Write boundary:** factual operational/release documents; later CR-13 is the sole shared integration slice  
**Sequence:** CR-03 and CR-09 may be separate read-only analysis workers; CR-13 must have one integration owner; later CR-14/16/17 follow dependencies.

- CR-03 DPIA factual data-flow pack
- CR-09 incident/observability acceptance matrix
- CR-13 integrated application changes and full regression — **single owner only**
- CR-14 customer trust-pack factual schedules
- CR-16 UK design-partner pilot
- CR-17 final evidence audit (independent reviewer owner)

### LANE A — Antigravity exact-path engineering
**Worker:** Direct Antigravity, Gemini 3.8 Flash worker contract  
**Boundary:** isolated source/test files only; network disabled; no deploy/merge/production authority.

Reserved:
- CR-10 Awaab deterministic policy core + isolated tests
- CR-12 identity-control core + isolated tests

These remain dependency-held until their evidence/design inputs pass. CR-10 and CR-12 must use disjoint writable paths. Shared API/model/schema integration is forbidden here and belongs to CR-13.

### LANE N — NVIDIA direct engineering
**Worker:** Direct NVIDIA owner worker / OpenCode NVIDIA path  
**Boundary:** isolated checkout, one active slice, deterministic verification, no production authority.

Allocated:
- CR-06 data-lifecycle mechanics gap/reuse plan
- CR-07 frozen-candidate security/licence evidence baseline
- CR-11 data-lifecycle core + isolated tests after CR-03/06 pass

NVIDIA service authentication must pass a bounded probe before any task is marked IN_PROGRESS. Do not claim work while the provider returns 401.

### LANE L — Local model drafting
**Worker:** Chapelgate local AI worker, Qwen/Phi stack through existing resource governor/queue  
**Boundary:** internal draft/summarisation only, supplied evidence only, one local model at a time.

Allocated when the existing local stack is healthy:
- assist CR-03 by structuring the factual data-flow inventory after source extraction;
- assist CR-08 by converting verified source findings into a closure checklist;
- assist CR-14 by formatting already-verified factual schedules.

The local model may not research current law, decide lawful basis, approve legal text, make release decisions, or modify production.

### LANE V — Independent verification
**Worker:** non-Claude verifier / deterministic CI / security worker as applicable  
**Boundary:** does not build the work it approves.

- exact targeted tests for CR-10/11/12
- full deterministic regression after CR-13
- release SBOM/SCA evidence
- independent security test gate CR-H04
- final evidence audit CR-17

## Collision guards

1. CR-10 owns only its new Awaab policy module/tests.
2. CR-11 owns only its new data-lifecycle core/tests.
3. CR-12 owns only its new identity contract/tests.
4. CR-13 alone may edit shared API, shared models/schema, migrations, readiness integration or shared application wiring.
5. Website legal-page changes stay in the website repository and must not be mixed with product-core changes.
6. Research workers write evidence; coding workers consume frozen evidence. They do not silently rewrite each other's requirements.
7. Human/professional gates remain CR-H01..CR-H05 and do not block unrelated slices.

## Current runtime readiness

- GitHub/NVDL self-hosted runner: available.
- NVIDIA repository secret: verified present/valid by the existing secret-hygiene workflow; owner-service NVIDIA model authentication is being independently re-probed before allocation.
- Direct Antigravity worker contract: offline acceptance passed; production/deploy/merge authority remains disabled.
- Local Chapelgate model: inventory exists, but the current Ollama default model path is empty and the local gateway is currently stopped. Treat Lane L as unavailable until the existing model-store path is recovered; do not redownload models merely to satisfy this plan.
- Claude: intentionally unavailable to this programme by owner instruction.

## Allocation policy

When a lane finishes a slice, it may take the next dependency-satisfied slice assigned to that lane. It must never take a slice already claimed by another worker. If its model/provider is unavailable, it releases/does not claim the slice so another authorised non-Claude lane can take it.

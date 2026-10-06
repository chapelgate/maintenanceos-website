# MaintenanceOS — Commercial Release Execution Slices

Date: 2026-10-06
Status: ACTIVE ALLOCATION
Authority: existing Control Room / commercial-release register remains authoritative. This file is the current collision-safe worker map; it is not a second queue.

## Non-negotiable execution rules

- Claude is excluded.
- Golden phone line, Twilio routing and golden voice runtime are out of scope.
- One slice has one owner. A worker must not claim another worker's slice.
- Specialist workers write analysis/evidence only unless their slice explicitly grants exact-path code ownership.
- Shared application/API/model/schema/migration wiring remains serial and belongs to one later integration owner only.
- Existing work is reused. A task already active elsewhere is not reallocated.
- Human/provider/legal/security gates remain human/external gates and are never self-certified by an internal model.
- If a preferred model/lane is unavailable, it receives no claim; the slice may be reassigned once, explicitly, to the next authorised non-Claude lane.

## Existing work deliberately not duplicated

| Existing work | Current owner/state | Decision |
|---|---|---|
| LUMI candidate evaluation/freeze | Existing LUMI programme | Continue existing owner; no new worker. |
| Golden/test phone readiness queue | Existing MaintenanceOS autonomous queue | Separate mission; no commercial-release worker edits phone path. |
| ReceptionOS owner on MaintenanceOS repo | Existing NVIDIA ReceptionOS mission | Do not commandeer checkout or files. |
| MaintenanceOS website current MOSWEB slice | Existing website NVIDIA worker | Commercial release workers produce evidence only; website worker remains sole code owner for its current slice. |
| Auth0 real tenant/application configuration | Issue #137; human/provider gate | No worker may fabricate provider values. |
| Existing-host deployment authority | Human/admin gate | No ad-hoc SSH key, rebuild or bypass. |
| Independent penetration test | External independent tester | Internal workers may prepare scope/evidence only. |
| Legal approval | UK technology/data counsel + owner | Internal workers may prepare factual packs only. |

## Wave A — NVIDIA specialist council, eight parallel non-overlapping slices

Execution evidence: NVIDIA Direct Lane workflow `MOS commercial release specialist wave`, run `37522726674`.
The workflow runs all eight specialists concurrently inside one runner slot and independently verifies each specialist with the other proven NVIDIA model.

| Slice | Owner/model | Exact scope | Forbidden overlap |
|---|---|---|---|
| MOSCR-01-IDENTITY | NVIDIA Nemotron specialist; gpt-oss verifier | Real IdP/Auth0 facts, adapter contract, MFA/RBAC/tenant/session/revocation acceptance | No lifecycle/Awaab/observability; no local password system |
| MOSCR-02-LIFECYCLE | NVIDIA Nemotron specialist; gpt-oss verifier | Retention/hold/DSAR/correction/erasure/backup lifecycle closure plan and tests | No identity/Awaab/legal wording |
| MOSCR-03-OBSERVABILITY | NVIDIA Nemotron specialist; gpt-oss verifier | Central redacted observability, alerts, correlation, tamper-resistant evidence acceptance | No lifecycle/IAM/Awaab |
| MOSCR-04-RECOVERY | NVIDIA gpt-oss specialist; Nemotron verifier | Managed PostgreSQL/PITR/migration/runtime rollback drill pack | No provisioning or target selection |
| MOSCR-05-SUPPLYCHAIN | NVIDIA gpt-oss specialist; Nemotron verifier | Frozen dependency/SBOM/audit/container/licence/vulnerability-exception evidence | No second scanner or CI stack |
| MOSCR-06-AWAAB | NVIDIA Nemotron specialist; gpt-oss verifier | Phase 2 hazard/edge/end-to-end deterministic acceptance matrix | No voice/AI behaviour |
| MOSCR-07-ACCESSIBILITY | NVIDIA gpt-oss specialist; Nemotron verifier | Voice/web/dashboard disabled-user acceptance evidence | No legal sign-off or unrelated code |
| MOSCR-08-PRIVACY-PROVIDERS | NVIDIA Nemotron specialist; gpt-oss verifier | Counsel fact pack for DPIA/provider/transfer/retention/caller-notice closure | No legal conclusion or invented provider config |

### Antigravity status

Preferred next lane after NVIDIA: Direct Antigravity / Gemini 3.8 Flash exact-path worker.

Current verified state on the NVIDIA host:
- `GEMINI_API_KEY` / `GOOGLE_API_KEY`: absent;
- no live Antigravity execution credential is exposed to the authorised lane;
- therefore Antigravity owns **no active slice** and creates no duplicate work.

When the authorised credential/path is restored, the first suitable unclaimed implementation slice is identity-adapter exact-path work after real Auth0 facts exist. Until then, work moves to the next authorised non-Claude lane rather than stopping.

## Wave B — implementation slices, released only from verified Wave A outputs

These are separate from the Wave A analysis slices, so there is no duplicate ownership.

| Slice | Preferred single owner | Writable boundary | Dependency |
|---|---|---|---|
| MOSCR-I01 Identity adapter | Antigravity if restored; otherwise one proven non-Claude code worker | Identity adapter + dedicated tests only | MOSCR-01 verified + issue #137 provider facts |
| MOSCR-I02 Lifecycle completion | Direct NVIDIA code worker | `lifecycle_runtime.py` + dedicated lifecycle tests; schema/shared API forbidden | MOSCR-02 verified |
| MOSCR-I03 Awaab acceptance repairs | Direct NVIDIA code worker | Awaab policy/runtime tests; production voice forbidden | MOSCR-06 verified |
| MOSCR-I04 Observability local integration | Normal MaintenanceOS owner | Existing logging/correlation/alert adapters only; no new service | MOSCR-03 verified + provider choice/config if needed |
| MOSCR-I05 Recovery tooling/evidence | Normal MaintenanceOS owner | Existing recovery scripts/docs/tests | MOSCR-04 verified + approved managed-PG target for live drill |
| MOSCR-I06 Frozen-candidate security evidence | CI/security verifier | Existing CI/SBOM/SCA/evidence paths only | MOSCR-05 verified + exact candidate freeze |
| MOSCR-I07 Accessibility remediation | Existing MaintenanceOS website/product owners, serial per repo | Website repo and product surface separately; no cross-repo shared writer | MOSCR-07 verified |
| MOSCR-I08 Privacy/provider factual closure | GitHub/current-source research worker | Evidence documents only | MOSCR-08 verified + exact active provider set |

## Wave C — one shared integration owner

Slice: MOSCR-INT-01.

Only after the accepted implementation slices above are complete, one MaintenanceOS integration owner may edit shared `api.py`, shared models/schema/migrations, readiness and application wiring. No other worker edits those shared surfaces concurrently.

Acceptance:
- exact candidate regressions pass on Linux/Python 3.13 and 3.12;
- Estate Gate passes;
- security/SBOM evidence is tied to the exact SHA/image;
- no golden-line file or routing change is hidden in the diff;
- release readiness remains fail-closed for missing human/provider evidence.

## Wave D — external/human gates

These are not worker-completable and do not stop unrelated machine work.

1. Restore approved existing-host deployment identity.
2. Create/approve real Auth0 tenant/application/API and record non-secret facts.
3. Approve retention periods/lawful bases and complete professional DPIA/legal pack.
4. Nominate/approve production-like managed PostgreSQL target for recovery drills.
5. Complete formal brand/IP decision.
6. Commission independent penetration test/retest.
7. Approve exact UK design-partner pilot candidate.
8. Final public commercial launch approval.

## Completion behaviour

Each worker must return:
- exact slice ID;
- evidence/source set;
- files/paths it owns or explicitly did not edit;
- tests/evidence run;
- result: PASS, VERIFIED GAP, BLOCKED or HUMAN/EXTERNAL GATE;
- next handoff.

When a slice finishes, it releases its claim. It does not automatically broaden into another slice. The allocator may then assign the next dependency-satisfied slice to the strongest available non-Claude lane.

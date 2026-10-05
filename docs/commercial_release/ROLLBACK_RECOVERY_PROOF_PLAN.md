# MaintenanceOS — Rollback and Recovery Proof Pack

**Control Room task:** #685  
**Status:** PLAN COMPLETE — live/production drill evidence remains a later release gate  
**Date:** 2026-10-05

This document defines deterministic recovery evidence and pass/fail criteria. It does **not** claim that production restore/PITR or live runtime rollback has been executed.

## Evidence already implemented

### Local database backup / restore
Canonical evidence:
- `backup_restore.py`
- `tests/test_backup_restore.py`

Implemented facts:
- SQLite backup uses SQLite's backup API rather than copying an open DB file.
- A SHA-256 manifest is generated.
- Verification checks SHA-256, SQLite integrity, foreign keys, and schema compatibility.
- Restore refuses to overwrite an existing destination.
- Restored bytes must match the verified backup hash.
- Tampered backup verification and restore fail closed.

Current deterministic local tests:
1. valid backup -> manifest/hash/schema verification -> clean restore -> seeded synthetic row readable;
2. tampered backup -> `hash_mismatch` -> restore refused;
3. backup to live DB path refused;
4. restore over an existing destination refused.

### Production recovery requirements already recorded
`SECURITY_DEPLOYMENT.md` requires before production:
- managed PostgreSQL migration and rollback rehearsal against a production-like copy;
- provider-native encrypted backups;
- PITR where required;
- a documented restore drill with measured recovery objectives;
- load/failover/disaster-recovery tests.

`DIGITALOCEAN_DEPLOYMENT.md` states the intended product database is an isolated managed PostgreSQL database and that durable persistence/backup/restore evidence is required before it becomes the production store.

## Recovery domains

Recovery must be proved independently for each domain. Passing one domain never implies another passed.

| Domain | Recovery target | Required proof |
|---|---|---|
| Application source | exact known-good Git SHA | deploy exact rollback SHA; health/readiness and deterministic regression evidence |
| Container/build | exact known-good image/build | image metadata/digest or reproducible build evidence; non-root runtime; health pass |
| Database schema | last compatible schema/migration state | forward migration rehearsal; rollback/down or restore strategy; schema-health pass |
| Database data | managed PostgreSQL backup/PITR | successful isolated restore to a new target; row/count/business invariants; measured times |
| Local SQLite test store | verified file backup | existing hash/integrity/schema/restore tests |
| Runtime configuration | known-good environment/config manifest | boolean-safe comparison; closed safety flags retained; no secret values emitted |
| Provider routing | known-good Twilio/Gemini/OpenAI/Resend configuration | explicit inventory before/after; no unauthorised phone-route or provider mutation |
| Workload identity/secrets | renewable identity path | restart/expiry/revocation/fail-closed tests; no long-lived copied bearer |
| Audit/evidence | incident/recovery evidence | source SHA, timestamps, operator/role, commands/actions, outputs, hashes and verdict retained |

## Required production-like database drill

Use **synthetic data only** until the release data-governance gate allows otherwise.

### Preconditions
- exact application SHA recorded;
- exact schema version recorded;
- isolated managed PostgreSQL test/restore target;
- encrypted provider backup/PITR enabled for the test target;
- synthetic fixture includes at minimum two tenants, work orders, critical-safety state, calls/events, action evidence, communications and automation jobs;
- no live telephony/provider mutation required.

### Test DR-DB-01 — full backup restore

1. Seed the deterministic synthetic fixture.
2. Record source DB schema version and invariant counts/hashes.
3. Create provider-native backup/snapshot.
4. Restore to a **new** isolated database.
5. Run schema readiness.
6. Run tenant-isolation and lifecycle/safety invariant tests against the restored DB.
7. Compare expected fixture counts and selected content hashes.

**PASS**
- restore completes without overwriting the source;
- restored schema is compatible;
- all required fixture invariants match;
- critical-safety/audit evidence remains present;
- tenant A data is not visible through tenant B paths;
- elapsed restore time is measured and recorded.

**FAIL**
- source is modified;
- schema mismatch;
- missing/extra critical records;
- cross-tenant leakage;
- restore cannot be validated;
- timing evidence is absent.

### Test DR-DB-02 — point-in-time recovery

1. Record a synthetic checkpoint T0.
2. Make deterministic post-T0 changes including create/update/close and audit events.
3. Record T1.
4. Restore to a new target at a selected point between T0 and T1.
5. Verify records expected before the recovery point are present and records expected after it are absent.
6. Verify schema and safety/audit invariants.

**PASS**
- recovered state corresponds to the selected point;
- no records after the target point appear;
- required pre-target audit/safety evidence remains;
- actual recovery point and elapsed restore time are recorded.

If the chosen managed-DB tier does not provide PITR, record that fact and define the accepted backup/RPO limitation. Do not claim PITR.

### Test DR-DB-03 — migration rollback/recovery

1. Restore a production-like synthetic copy.
2. Apply the exact release migration.
3. Run schema-health and relevant regressions.
4. Inject/reproduce a migration failure or acceptance failure.
5. Execute the documented rollback strategy:
   - supported down/reverse migration, **or**
   - restore from the pre-migration provider backup/PITR point.
6. Re-run schema-health and fixture invariants.

**PASS**
- rollback route is known before deployment;
- pre-release state is restored without tenant/safety/audit corruption;
- measured rollback time is recorded.

## Application/runtime rollback drill

### Test DR-APP-01 — bad candidate rollback

1. Record current known-good source/runtime version.
2. Deploy a synthetic/staged candidate only.
3. Fail a deterministic acceptance gate deliberately or use a known failing fixture.
4. Roll back to the exact known-good source/build.
5. Re-run:
   - `/health`;
   - appropriate readiness profile;
   - deterministic safety/lifecycle tests;
   - tenant-isolation test;
   - provider ingress remains closed unless the test window was separately authorised.

**PASS**
- exact rollback version is proven after rollback;
- safety flags/closed-mode settings are preserved;
- no phone-number rerouting is required merely to roll back code;
- service returns to accepted health/readiness;
- rollback elapsed time is recorded.

### Test DR-CONFIG-01 — configuration rollback

Capture a **secret-free** manifest of:
- provider selections;
- feature/ingress flags;
- database deployment mode;
- public origin identity;
- model/voice identifiers where non-secret;
- relevant capacity limits.

Test one controlled configuration change in staging, then restore the prior manifest.

**PASS**
- exact prior non-secret state is re-established;
- secrets never appear in artifacts/logs;
- dangerous features do not become enabled as a side effect.

## Workload identity / secret recovery

Canonical evidence:
- `docs/migration/USH_IDENTITY_LIFECYCLE.md`
- `tests/test_ush_identity_lifecycle.py`

Existing design requirement:
- durable workload identity + short-lived bearer;
- expiry/restart -> automatic re-exchange;
- revocation -> fail closed;
- missing durable identity -> fail closed;
- legacy permanent bearer cannot override renewable identity.

### Test DR-ID-01
Restart with bearer cache removed but durable approved identity present.

**PASS:** a new short-lived bearer is obtained without Andrew manually entering a permanent token.

### Test DR-ID-02
Revoke/disable the workload principal.

**PASS:** credential exchange and dependent privileged action fail closed; no fallback to a stale long-lived secret.

## Telephony/provider rollback safety

Recovery tests must not casually mutate the golden/live phone line.

For any controlled provider-routing test:
- record the number/account/environment being modified;
- use only the separately authorised test route;
- capture the prior webhook/provider configuration;
- restore it after the test;
- independently verify the provider-side state after rollback.

**FAIL:** any test requires guessing a phone route, rebuilding the golden host, or changing the production number without a separately authorised gate.

## Recovery measurements

For every executed drill retain:

| Metric | Definition |
|---|---|
| Detection time | fault injection / first failed acceptance -> fault recognised |
| Decision time | fault recognised -> rollback/restore authorised by policy/operator role |
| Start time | rollback/restore command/action begins |
| Service recovery time | start -> accepted health/readiness restored |
| Data recovery time | start -> restored DB passes schema + invariant validation |
| Total recovery time | fault injection -> complete accepted service/data recovery |
| Recovery point | latest data point demonstrably present after restore |
| Data-loss window | difference between failure time and proven recovery point |

Do **not** invent RTO/RPO targets in this pack. Business/customer/legal requirements must approve targets; the drills measure actual results so those targets can be evaluated.

## Failure-injection matrix

| ID | Injection | Expected behaviour | PASS evidence |
|---|---|---|---|
| FI-01 | corrupt local backup bytes | verification rejects `hash_mismatch` | test/log result |
| FI-02 | restore destination already exists | restore refuses overwrite | existing file unchanged |
| FI-03 | incompatible schema | readiness/schema-health fails closed | missing/incompatible schema evidence |
| FI-04 | failed release migration | rollback/restore route invoked | old schema/invariants restored |
| FI-05 | provider DB unavailable | app/readiness fails closed; no unsafe write claim | health/readiness + incident evidence |
| FI-06 | expired ephemeral workload bearer | auto-renew if durable identity valid | one successful renewal |
| FI-07 | revoked workload identity | fail closed | no privileged fallback |
| FI-08 | bad application candidate | exact known-good build restored | SHA/build + post-rollback acceptance |
| FI-09 | invalid provider/webhook config in staging | ingress remains fail-closed | readiness/provider-webhook evidence |
| FI-10 | restore from older backup | lifecycle deletion replay/quarantine requirement from CR-06/CR-11 enforced before use | lifecycle replay evidence after integration |

## Independent review

The worker that performs a recovery drill may not be the sole approver.

Independent reviewer must verify:
1. exact source/build/database versions;
2. fault was genuinely injected/reproduced;
3. rollback/restore was not simply a fresh rebuild with missing historical state;
4. pass/fail invariants were run after recovery;
5. timing values come from recorded timestamps;
6. failed steps are retained rather than removed from the evidence;
7. no secret values or resident/customer data appear in the evidence pack;
8. the final verdict is **PASS**, **FAIL**, or **BLOCKED** — never assumed from partial success.

## Evidence bundle per drill

Retain:
- drill ID and UTC timestamps;
- exact source SHA/build ID;
- database engine/tier/region and backup/PITR mode without credentials;
- schema version;
- synthetic fixture hash/version;
- pre-state invariant report;
- backup/snapshot/PITR reference;
- restore target reference;
- post-state invariant report;
- test outputs;
- recovery metrics;
- incident/problem record;
- independent reviewer verdict.

## Current verdict

**#685 is complete as a rollback/recovery proof plan.**

Already proven:
- deterministic local SQLite backup verification/restore controls;
- tamper and overwrite refusal tests;
- renewable identity lifecycle design/tests in source.

Still required before production:
- actual managed-PostgreSQL backup/PITR configuration evidence;
- executed isolated production-like restore drill;
- migration rollback rehearsal;
- actual measured recovery results;
- exact runtime/config rollback proof on the release candidate;
- independent reviewer acceptance.

These execution items belong in later commercial-release acceptance; they are not falsely marked complete by this planning document.

# Incident Observability Matrix

Status: CR-09 production acceptance planning evidence.
Scope: observability, incident evidence, readiness, provider failure handling, worker retry/escalation, audit events, rollback/recovery evidence, and tests.
Write-scope rule: this document records evidence only. It does not add code, configuration, workflow, production, or monitoring-service changes.

## Planning Decision

`DESIGN INTENT`: Reuse existing MaintenanceOS signals first. Do not add a new monitoring service at this planning stage. The acceptance decision is to prove what is already emitted locally, identify where existing logs/audit rows/readiness booleans are insufficient for production, and hand the central/tamper-resistant observability requirement to the production operations design without inventing a vendor or service here.

`DESIGN INTENT`: `SECURITY_DEPLOYMENT.md:27` to `SECURITY_DEPLOYMENT.md:28` requires central structured logs with redaction, alerting, correlation IDs, access controls, and tested outage notifications before public test ingress. `SECURITY_DEPLOYMENT.md:41` requires tamper-resistant central audit storage before production.

## Evidence Inventory

| Area | Classification | Existing evidence | Production acceptance meaning |
|---|---|---|---|
| Structured operational logging | `IMPLEMENTED FACT` | `operational_logging.py:13` defines a narrow `SAFE_EVENT_FIELDS` allowlist; `operational_logging.py:24` to `operational_logging.py:33` defines sensitive key/value patterns; `operational_logging.py:54` to `operational_logging.py:68` emits redacted JSON; `operational_logging.py:80` to `operational_logging.py:93` gates emission behind `ENABLE_STRUCTURED_LOGGING`. | Local structured JSON exists and is redacted by design, but it is opt-in and process-local stream logging only. |
| Readiness | `IMPLEMENTED FACT` | `readiness.py:1` states boolean-only reporting; `readiness.py:115` to `readiness.py:155` defines readiness checks; `readiness.py:182` to `readiness.py:191` emits `voice_ready`, `local_pre_live_ready`, `public_test_config_ready`, `controlled_call_config_ready`, and `live_ready`. | Readiness output can drive a deployment gate and alert, without leaking settings. |
| Health | `IMPLEMENTED FACT` | `api.py:128` to `api.py:150` returns `/health` with `ok`, version, realtime flag, active calls, capacity limits, backend, drain state, utilisation, and burn estimate. | Health is useful for liveness/capacity visibility, but not sufficient as a production incident timeline. |
| Provider ingress failure | `IMPLEMENTED FACT` | `api.py:365` to `api.py:406` rejects disabled ingress, invalid Twilio signatures, wrong test number, missing tenant, capacity rejection, and `provider_ready()` failure. It records `capacity_rejected` and `voice_not_ready` interruptions. | Inbound voice fails closed and persists interruption reasons where a call session exists. |
| Provider runtime failure | `IMPLEMENTED FACT` | `provider_runtime.py:16` allowlists `openai` and `gemini`; `provider_runtime.py:46` to `provider_runtime.py:62` requires transport and adapter readiness; `provider_runtime.py:65` to `provider_runtime.py:70` closes unknown providers with code `1008`. | Provider selection has a fail-closed boundary. |
| Provider webhook mutation | `IMPLEMENTED FACT` | `provider_webhooks.py:51` to `provider_webhooks.py:61` plans skip/fail/configure states; `provider_webhooks.py:72` to `provider_webhooks.py:93` mutates Twilio only after readiness; `provider_webhooks.py:121` to `provider_webhooks.py:131` skips closed ingress and fails incomplete live ingress. | Twilio mutation is controlled and closed mode is an explicit non-error state. |
| Stream status and call events | `IMPLEMENTED FACT` | `voice_bridge.py:638` to `voice_bridge.py:652` records Twilio stream status as an operational event plus `CallEvent`, and promotes it to `AuditEvent` when a work order exists. | Stream status is captured, but central alerting on stream errors is not implemented. |
| Voice escalation | `IMPLEMENTED FACT` | `voice_bridge.py:428` to `voice_bridge.py:462` persists call escalation state, `CallEvent`, `Escalation`, and `AuditEvent`; `voice_bridge.py:481` to `voice_bridge.py:501` records transcript segments and triggers deterministic escalation. | Safety/handoff reasons become queryable operational evidence. |
| Voice provider failure handling | `IMPLEMENTED FACT` | `voice_bridge.py:812` to `voice_bridge.py:833` records transfer/interruption reasons; `voice_bridge.py:1172` to `voice_bridge.py:1183` transfers on OpenAI realtime errors, failed/incomplete responses, and missing output transcripts; `voice_bridge.py:1205` to `voice_bridge.py:1209` records `voice_bridge_failure:<ExceptionType>` and closes the call session. | Provider failures are converted to local interruption/escalation evidence. |
| Action evidence | `IMPLEMENTED FACT` | `action_evidence.py:18` to `action_evidence.py:30` defines confirmable action types; `action_evidence.py:33` to `action_evidence.py:95` enforces tenant binding and idempotency; `action_evidence.py:96` to `action_evidence.py:114` records `ACTION_RESULT_RECORDED` in `AuditEvent` or `CallEvent`. | Consequential action claims can be backed by tenant-bound local evidence. |
| Worker retry and escalation | `IMPLEMENTED FACT` | `worker.py:26` to `worker.py:36` bounds attempts/lease/retry delay; `worker.py:39` to `worker.py:56` recovers stale jobs; `worker.py:117` to `worker.py:147` records `AUTOMATION_JOB_FAILED` and opens `SYSTEM` escalation on final failure; `worker.py:201` to `worker.py:216` opens `SLA` escalation on breached SLA. | Retries, stale job recovery, final failure, and SLA breach are local DB events/escalations. |
| Dead-letter handling | `GAP` | `tests/test_worker_recovery.py:64` names "dead letters", but `worker.py:123` to `worker.py:146` implements final `FAILED` status plus `SYSTEM` escalation, not a separate dead-letter queue/store. | Accept as local failed-job escalation, not production-grade dead-letter observability. |
| Capacity | `IMPLEMENTED FACT` | `call_capacity.py:56` to `call_capacity.py:67` defines capacity snapshot fields; `call_capacity.py:110` to `call_capacity.py:143` rejects duplicate, draining, cost-budget, global, and per-client capacity; `call_capacity.py:290` to `call_capacity.py:304` expires stale leases and supports drain. | Capacity state exists for health and local operation; production alert thresholds still need central wiring. |
| Backup/restore | `IMPLEMENTED FACT` | `backup_restore.py:40` to `backup_restore.py:71` verifies backup hash, SQLite integrity, FK health, and schema compatibility; `backup_restore.py:74` to `backup_restore.py:105` creates a manifest with SHA-256; `backup_restore.py:108` to `backup_restore.py:129` refuses overwrite and verifies restored hash. | Local SQLite recovery evidence exists. Production backup destination, PITR, restore drill objectives, and retention are separate gaps. |
| Production recovery intent | `DESIGN INTENT` | `SECURITY_DEPLOYMENT.md:31` to `SECURITY_DEPLOYMENT.md:36` requires managed PostgreSQL rollback rehearsal, provider-native encrypted backups, PITR where required, and documented restore drills with measured recovery objectives. | Recovery acceptance must include provider-native production evidence, not only local SQLite proof. |
| Central/tamper-resistant observability | `GAP` | Local logs and DB audit events exist, but `SECURITY_DEPLOYMENT.md:27` to `SECURITY_DEPLOYMENT.md:28` and `SECURITY_DEPLOYMENT.md:41` define central logs/alerting/correlation/access controls/tamper-resistant audit as required before production. | Current implementation is not sufficient for production incident acceptance until central, access-controlled, tamper-resistant collection is implemented and tested. |

## Redaction And PII Requirements

| Requirement | Classification | Evidence | Acceptance test |
|---|---|---|---|
| Logs must not emit credentials, tokens, phone numbers, email addresses, provider IDs, request bodies, caller values, or transcripts. | `IMPLEMENTED FACT` for local formatter; `GAP` for direct tests. | `operational_logging.py:24` to `operational_logging.py:33` covers sensitive key/value patterns; `operational_logging.py:36` to `operational_logging.py:68` redacts and only emits allowlisted fields. Search found no dedicated `tests/` coverage for `RedactedJsonFormatter`. | Add/require a test that emits representative bearer tokens, OpenAI-style keys, phone, email, Twilio-like provider IDs, transcript/detail/body fields, and verifies only safe redacted JSON. |
| Readiness must avoid secret values. | `IMPLEMENTED FACT` | `readiness.py:1` documents boolean-only reporting; `readiness.py:182` to `readiness.py:191` returns booleans derived from checks. | `tests/test_readiness_profiles.py:8` to `tests/test_readiness_profiles.py:30` covers readiness profile booleans. |
| Caller phone storage must not keep raw caller ID in call session. | `IMPLEMENTED FACT` | `voice_bridge.py:268` to `voice_bridge.py:271` hashes caller phone into `sha256:` form. | `tests/test_voice_bridge.py:798` to `tests/test_voice_bridge.py:808` asserts identity lock and hashed caller without raw `+44`. |
| Evidence emails/reports must avoid treating invented assistant statements as proof. | `IMPLEMENTED FACT` | `action_evidence.py:117` to `action_evidence.py:145` derives confirmed actions from `ActionExecution`, appointments/audit, acceptance, or resident confirmation. | `tests/test_voice_action_claims.py:55` to `tests/test_voice_action_claims.py:87` rejects false action claims; `tests/test_voice_action_claims.py:108` to `tests/test_voice_action_claims.py:129` proves pre-work-order action evidence is tenant-bound and call-scoped. |

## Health, Readiness, Outage, And Provider Failure Conditions

| Condition | Classification | Signal/event | Severity | Owner/escalation target |
|---|---|---|---|---|
| `/health` unavailable or returns no `ok`. | `DESIGN INTENT` | `api.py:128` to `api.py:150`; external check not implemented in repo. | P1 if public ingress is armed; P2 in closed test mode. | `<ROLE_PLATFORM_ON_CALL>` |
| `live_ready=false` or `controlled_call_config_ready=false` before controlled call. | `IMPLEMENTED FACT` signal; `GAP` alert. | `readiness.py:187` to `readiness.py:191`. | P1 for scheduled live test; P2 otherwise. | `<ROLE_RELEASE_MANAGER>` and `<ROLE_PLATFORM_ON_CALL>` |
| `provider_ready()` false during inbound call. | `IMPLEMENTED FACT` | `api.py:400` to `api.py:405` releases lease, records `voice_not_ready`, returns fallback TwiML. | P1 when live ingress is armed. | `<ROLE_VOICE_OPERATIONS_ON_CALL>` |
| Twilio signature invalid or wrong number. | `IMPLEMENTED FACT` | `api.py:370` to `api.py:374`; `provider_webhooks.py:72` to `provider_webhooks.py:93`. | P1 if repeated; P2 isolated. | `<ROLE_SECURITY_ON_CALL>` |
| Capacity rejected. | `IMPLEMENTED FACT` | `api.py:386` to `api.py:399`; `call_capacity.py:119` to `call_capacity.py:138`. | P1 if sustained; P2 for isolated burst. | `<ROLE_PLATFORM_ON_CALL>` |
| WebSocket rejected/rate limited/signature rejected. | `IMPLEMENTED FACT` local event; `GAP` central alert. | `voice_bridge.py:739` to `voice_bridge.py:753`. | P1 sustained; P2 isolated. | `<ROLE_VOICE_OPERATIONS_ON_CALL>` |
| OpenAI/Gemini realtime provider error, failed response, missing transcript, or transport disconnect. | `IMPLEMENTED FACT` for local handling; `GAP` central alert. | `voice_bridge.py:1172` to `voice_bridge.py:1209`. | P1 if calls cannot complete; P2 isolated. | `<ROLE_VOICE_OPERATIONS_ON_CALL>` |
| Worker automation final failure. | `IMPLEMENTED FACT` | `worker.py:117` to `worker.py:147`; `tests/test_worker_recovery.py:64` to `tests/test_worker_recovery.py:89`. | P2 normally; P1 if safety/SLA affected. | `<ROLE_OPERATIONS_ON_CALL>` |
| SLA breach escalation. | `IMPLEMENTED FACT` | `worker.py:201` to `worker.py:216`. | P1 for emergency/critical; P2 otherwise. | `<ROLE_OPERATIONS_MANAGER>` |
| Backup verification failure or restore failure. | `IMPLEMENTED FACT` locally; `GAP` production backup alert. | `backup_restore.py:40` to `backup_restore.py:71`; `tests/test_backup_restore.py:39` to `tests/test_backup_restore.py:50`. | P1 production; P2 test. | `<ROLE_PLATFORM_ON_CALL>` |
| Suspected data breach or log PII leak. | `DESIGN INTENT`/`GAP` | Redaction exists locally; incident workflow and central log leak detector not implemented in repo. | P1. | `<ROLE_SECURITY_ON_CALL>` and `<ROLE_DATA_PROTECTION_LEAD>` |

## Correlation Identifiers

| Identifier | Classification | Evidence | Gap/acceptance note |
|---|---|---|---|
| `request_id` | `IMPLEMENTED FACT` as allowed field; `GAP` as end-to-end propagation. | `operational_logging.py:20` allows `request_id`. | No inspected middleware generates or propagates a request ID across HTTP, worker, DB audit, and provider calls. |
| `call_sid` | `IMPLEMENTED FACT` | `voice_bridge.py:268` to `voice_bridge.py:283` creates/returns call sessions by Twilio `call_sid`; `voice_bridge.py:451` to `voice_bridge.py:453` includes `call_session_id` and `call_sid` in escalation detail. | Treat as provider call correlation ID; redact from logs if provider ID patterns match. |
| `call_session_id` | `IMPLEMENTED FACT` | `voice_bridge.py:414` to `voice_bridge.py:425` records call events by session; `voice_bridge.py:638` to `voice_bridge.py:652` records stream status by session. | Must be included in central incident timeline without exposing transcript/body. |
| `work_order_id` | `IMPLEMENTED FACT` | `models.py:248` to `models.py:251` indexes `AuditEvent.work_order_id`; `action_evidence.py:102` to `action_evidence.py:105` audits work-order action results. | Required for operations incident triage and SLA escalation. |
| `action_key` | `IMPLEMENTED FACT` | `action_evidence.py:53` to `action_evidence.py:72` requires action idempotency key and rejects contradictions. | Must be retained as evidence identifier, not treated as human-readable proof by itself. |
| `stream_sid` | `IMPLEMENTED FACT` | `voice_bridge.py:638` to `voice_bridge.py:649` records Twilio stream status detail with stream SID. | Useful for provider support cases; central redaction policy must decide whether provider IDs are masked in logs while preserving DB audit evidence. |
| `job_id` | `IMPLEMENTED FACT` | `worker.py:52` to `worker.py:54` and `worker.py:127` to `worker.py:133` include job ID/attempts in audit detail. | Worker alerts must include job ID and work order ID. |

## Audit And Evidence Retention Requirement

`DESIGN INTENT`: Evidence and audit retention must be owner-controlled, access-controlled, and sufficient for commercial release due diligence, support investigation, legal/privacy review, and safety incident reconstruction.

`GAP`: No retention duration is approved or invented here. Existing commercial release docs already avoid inventing durations, and production acceptance must preserve that: define retention by data class through governance/legal/business approval before launch.

`IMPLEMENTED FACT`: Local audit/evidence rows are stored in application tables such as `AuditEvent`, `CallEvent`, `ActionExecution`, `Escalation`, and `AutomationJob` (`models.py:229`, `models.py:239`, `models.py:248`, `models.py:313`, `models.py:365`).

`GAP`: Local DB audit rows are not tamper-resistant central audit storage. Production acceptance requires append-only or otherwise tamper-resistant central audit/evidence storage with access controls, checksums or equivalent integrity evidence, run/source identifiers, and tested retrieval. This matrix does not choose a new service.

## Tabletop Scenarios

| Scenario | Classification | Required evidence | Pass/fail acceptance |
|---|---|---|---|
| Public provider outage during active calls. | `DESIGN INTENT` using implemented local signals. | `voice_not_ready`, `openai_realtime_error:*`, `openai_response_failed`, `voice_transport_disconnected`, affected `call_session_id`, `call_sid`, fallback/handoff evidence. | Pass when local DB evidence plus central alert/timeline proves affected calls, fallback path, owner acknowledgement, and recovery. Fail if only stdout/local logs exist. |
| Twilio webhook misconfiguration or unauthorized mutation attempt. | `IMPLEMENTED FACT` local controls; `GAP` central alert. | `ProviderWebhookError`, closed-mode skip status, readiness booleans, Twilio status callback events. | Pass when mutation only occurs in ready state and unauthorized attempts alert `<ROLE_SECURITY_ON_CALL>`. |
| Worker retry exhaustion on contractor timeout/reminder job. | `IMPLEMENTED FACT` local evidence. | `AUTOMATION_JOB_FAILED`, attempts, final flag, `SYSTEM` escalation, work order ID. | Pass when final failure opens escalation and central alert links to work order/job ID. |
| SLA breach missed by automation. | `IMPLEMENTED FACT` local escalation; `GAP` central monitoring. | `SLA` escalation from `worker.py:201` to `worker.py:216`, work order age/target. | Pass when escalation is surfaced to `<ROLE_OPERATIONS_MANAGER>` and retained. |
| Suspected transcript or phone-number leakage in logs. | `GAP` test coverage. | Formatter test output, central log search evidence, incident audit. | Pass when redaction tests cover representative PII and central logs prove no leak or produce a breach workflow. |
| Database restore after corrupted local backup. | `IMPLEMENTED FACT` local; `GAP` production. | Backup manifest SHA-256, verification result, restore result. | Pass locally with `tests/test_backup_restore.py`; production pass requires provider-native restore drill evidence and measured objectives. |
| Security breach/tabletop: malicious signed-provider replay or invalid signature burst. | `IMPLEMENTED FACT` fail-closed controls; `GAP` central detection. | 403s, signature validation failure, source/request metadata without sensitive body, alert, incident timeline. | Pass when repeated invalid signatures alert `<ROLE_SECURITY_ON_CALL>` and no provider mutation/call admission occurs. |
| Tampering concern: local audit row changed or deleted. | `GAP` | Local DB alone cannot prove non-tampering. | Fail until central/tamper-resistant evidence store exists and retrieval/integrity checks pass. |

## Pass/Fail Acceptance Tests

| Test | Classification | Current evidence | Production acceptance |
|---|---|---|---|
| Readiness profiles. | `IMPLEMENTED FACT` | `tests/test_readiness_profiles.py:8` to `tests/test_readiness_profiles.py:30`. | Must pass in CI and in pre-call environment check. |
| Provider webhook fail-closed and closed-mode skip. | `IMPLEMENTED FACT` | `tests/test_provider_webhooks.py:32` to `tests/test_provider_webhooks.py:136`. | Must pass before any provider webhook mutation. |
| Provider adapter allowlist and unknown-provider close. | `IMPLEMENTED FACT` | `tests/test_provider_adapter_contract.py:6` to `tests/test_provider_adapter_contract.py:70`. | Must pass before live provider selection. |
| Voice readiness fail-closed config. | `IMPLEMENTED FACT` | `tests/test_voice_bridge.py:160` to `tests/test_voice_bridge.py:213`. | Must pass before controlled call. |
| Voice escalation deterministic authority. | `IMPLEMENTED FACT` | `tests/test_voice_bridge.py:250` to `tests/test_voice_bridge.py:277`. | Must pass before public ingress. |
| Identity hash/lock and call-event evidence. | `IMPLEMENTED FACT` | `tests/test_voice_bridge.py:798` to `tests/test_voice_bridge.py:808`. | Must pass before real caller data. |
| Action evidence and false action claims. | `IMPLEMENTED FACT` | `tests/test_voice_action_claims.py:55` to `tests/test_voice_action_claims.py:129`. | Must pass before AI can mention consequential outcomes. |
| Worker retry/final escalation/stale recovery. | `IMPLEMENTED FACT` | `tests/test_worker_recovery.py:64` to `tests/test_worker_recovery.py:102`. | Must pass before scheduled automation is enabled. |
| Backup tamper/restore proof. | `IMPLEMENTED FACT` | `tests/test_backup_restore.py:15` to `tests/test_backup_restore.py:65`. | Local pass is not production pass; production still needs managed backup/PITR drill evidence. |
| Operational logging redaction unit test. | `GAP` | No dedicated test found by `rg "operational_logging|RedactedJsonFormatter|ENABLE_STRUCTURED_LOGGING|\\[REDACTED\\]" tests docs`. | Required before production observability acceptance. |
| Central alert delivery test. | `GAP` | No central alerting implementation found. | Required before production: prove alert for provider outage, capacity rejection surge, readiness false, worker final failure, SLA breach, invalid signature burst, backup failure, and suspected breach. |
| Tamper-resistant audit retrieval test. | `GAP` | Local DB audit exists; `SECURITY_DEPLOYMENT.md:41` requires central tamper-resistant audit storage. | Required before production: prove event retrieval by `work_order_id`, `call_session_id`, `call_sid`, `job_id`, and time window. |

## Exact Gap: Local Logging Versus Required Central Observability

| Requirement | Current implementation | Gap |
|---|---|---|
| Central structured log collection | `operational_logging.py` emits redacted JSON to a local logger/stream when `ENABLE_STRUCTURED_LOGGING=true`. | No repository evidence of central collection, log retention, access control, query dashboard, alert routing, or tested notification delivery. |
| Correlation IDs | `request_id` is an allowed log field; DB events carry work-order/call/action/job identifiers. | No end-to-end request ID generation/propagation across HTTP, WebSocket, provider callbacks, worker, DB audit, and central logs. |
| Tamper-resistant audit | DB tables record `AuditEvent`, `CallEvent`, `ActionExecution`, `Escalation`, and worker state. | Local application DB rows can be changed by privileged DB access; no append-only/tamper-resistant external evidence store is implemented. |
| Alerting | Readiness, health, capacity, worker failure, stream status, and provider failure signals exist locally. | No alert rules, severity routing, escalation acknowledgement, on-call notification proof, or outage notification test exists in repo. |
| Retention | Local backup manifests include SHA-256; commercial docs require retention decisions. | No approved evidence/audit retention duration, legal hold workflow, central evidence retention location, or provider log retention proof is implemented here. |
| Production recovery | Local SQLite backup/restore is tested. | Managed PostgreSQL/provider-native backups, PITR settings, restore drill objectives, and production recovery evidence remain unimplemented/unknown in this repo. |

## Acceptance Verdict

`IMPLEMENTED FACT`: MaintenanceOS already has strong local signals for readiness, health, voice/provider failure, action evidence, worker retry/failure/escalation, safety escalation, capacity, and local backup verification.

`DESIGN INTENT`: Production requires central redacted observability, alerting, correlation IDs, tested outage notifications, production recovery drills, and tamper-resistant audit evidence.

`GAP`: CR-09 production acceptance cannot pass on local logging/database audit alone. It passes as a planning artifact only when the above gaps are accepted into the commercial release problem register and no new monitoring service is added during this slice.

`UNKNOWN`: Exact production observability provider, retention durations, alert routing tool, managed database backup/PITR settings, and legal/privacy-approved evidence retention classes are not evidenced by inspected repository source and are not invented here.


## 2026-10-06 — redaction regression evidence update

The earlier CR-09 gap stating that no dedicated structured-logging redaction regression existed is now partially closed.

Current canonical evidence:
- `tests/test_operational_logging.py` added on `main` by `bfe0b84e5a362322f1b831f99059d015c451b00e`;
- the test covers sensitive-key redaction, bearer/API-key/email/phone/provider-ID value scrubbing, the existing safe-field allowlist, fail-closed disabled logging, and event-name normalization/formatter-time scrubbing;
- the change was tests/evidence only and did not add a log sink, provider, service, phone-line change or runtime behavior.

This does **not** close CR-09 overall. Central log collection, alert delivery/acknowledgement, end-to-end correlation, tamper-resistant evidence retention and production recovery/incident drills remain separate release evidence requirements.

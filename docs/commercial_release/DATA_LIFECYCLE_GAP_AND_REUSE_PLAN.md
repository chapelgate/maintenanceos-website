# CR-06 Data Lifecycle Gap And Reuse Plan

Status: implementation plan only. No retention period is approved here; all durations and classes remain configurable and unresolved for counsel/business approval.

## Scope And Classification Legend

- `IMPLEMENTED FACT`: directly evidenced in repository source.
- `DESIGN INTENT`: documented requirement or intended control, not complete implementation.
- `GAP`: missing implementation needed for commercial release.
- `UNKNOWN`: not evidenced in this worktree.

## Source-Proven Current State

- `IMPLEMENTED FACT`: The application stores tenant, user, property, resident, contractor, work-order, approval, evidence, communication, unmatched inbound, job, audit, tenant-boundary, call, call-event, action, invoice/evidence-identity, safety, and runtime-control records in the single SQLAlchemy model set in `models.py` (`Client`, `User`, `Property`, `Resident`, `Contractor`, `WorkOrder`, `Approval`, `CompletionEvidence`, `Communication`, `CommunicationDelivery`, `UnmatchedInbound`, `AutomationJob`, `AuditEvent`, `TenantBoundary`, `CallSessionTenant`, `CriticalSafetyState`, `ActionReceipt`, `ActionExecution`, `EvidenceIdentity`, `CallSession`, `CallEvent`) (`models.py:22`, `models.py:29`, `models.py:38`, `models.py:48`, `models.py:58`, `models.py:78`, `models.py:98`, `models.py:160`, `models.py:190`, `models.py:202`, `models.py:219`, `models.py:229`, `models.py:248`, `models.py:257`, `models.py:264`, `models.py:269`, `models.py:301`, `models.py:313`, `models.py:336`, `models.py:351`, `models.py:365`).
- `IMPLEMENTED FACT`: The existing worker already provides deterministic scheduled execution using `AutomationJob.status`, `AutomationJob.run_at`, leases, attempts, retry/failure audit, and a 30-second APScheduler cycle (`worker.py:39`, `worker.py:42`, `worker.py:150`, `worker.py:154`, `worker.py:161`, `worker.py:201`, `worker.py:219`, `worker.py:231`, `worker.py:232`).
- `IMPLEMENTED FACT`: Idempotency is tenant-scoped through `ActionReceipt` and `claim_action`, and tests prove duplicate action keys are isolated by tenant (`idempotency.py:9`, `models.py:301`, `tests/test_tenant_isolation_extended.py:87`, `tests/test_tenant_isolation_extended.py:90`).
- `IMPLEMENTED FACT`: Domain audit exists through `AuditEvent` and `operations.audit`, and core lifecycle transitions are audited by `transition_work_order` (`models.py:248`, `operations.py:17`, `lifecycle.py:19`).
- `IMPLEMENTED FACT`: Active critical-safety state and work orders with active critical safety cannot be directly deleted by ORM mutation (`models.py:386`).
- `IMPLEMENTED FACT`: Human-review/operational holds exist as `Approval` records for workflow blocking, including safety, identity, evidence reuse, contractor timeout, triage, repeat repair, and post-safety clearance paths (`operations.py:175`, `operations.py:217`, `operations.py:237`, `operations.py:323`, `operations.py:354`, `operations.py:398`, `tests/test_lifecycle_integrity.py:72`).
- `IMPLEMENTED FACT`: Tenant isolation is implemented through direct `client_id` ownership and helper checks such as `require_client_resource`, voice tenant binding, and call tenant lookup (`tenant_security.py:70`, `tenant_security.py:81`, `tenant_security.py:88`).
- `IMPLEMENTED FACT`: Outbound communications hash recipients before storing them in `Communication.participant`, then record communication delivery state and audit events (`communications.py:22`, `communications.py:26`, `communications.py:49`, `communications.py:51`, `communications.py:54`, `communications.py:65`, `communications.py:72`, `communications.py:94`).
- `IMPLEMENTED FACT`: Call sessions hash caller identifiers, persist transcripts in `CallSession.transcript`, persist per-call events, and may convert unmatched closed transcripts into `UnmatchedInbound` or call notifications (`voice_bridge.py:268`, `voice_bridge.py:271`, `voice_bridge.py:278`, `voice_bridge.py:416`, `voice_bridge.py:481`, `voice_bridge.py:491`, `voice_bridge.py:513`, `voice_bridge.py:529`, `voice_bridge.py:532`, `voice_bridge.py:592`).
- `IMPLEMENTED FACT`: OpenAI/Gemini call audio is handled in realtime buffers/streams in the inspected source; transcripts are persisted as text segments (`voice_bridge.py:788`, `voice_bridge.py:789`, `voice_bridge.py:840`, `voice_bridge.py:891`, `voice_bridge.py:1152`, `gemini_voice.py:600`, `gemini_voice.py:927`).
- `IMPLEMENTED FACT`: Tenant-scoped CSV export exists only for work orders and selected work-order fields (`export_csv.py:7`, `export_csv.py:11`, `export_csv.py:12`, `tests/test_tenant_isolation_extended.py:133`).
- `IMPLEMENTED FACT`: Local SQLite backup/restore exists, hashes backups, writes a manifest, verifies integrity/schema, refuses live-path backup, and refuses overwrite on restore (`backup_restore.py:24`, `backup_restore.py:40`, `backup_restore.py:49`, `backup_restore.py:74`, `backup_restore.py:92`, `backup_restore.py:99`, `backup_restore.py:108`, `backup_restore.py:125`, `tests/test_backup_restore.py:8`, `tests/test_backup_restore.py:35`).
- `DESIGN INTENT`: Data governance requires per-class retention, legal/operational holds, scheduled deletion, preservation of safety/audit records under hold, restricted transcript access, and reviewed access/correction/deletion/breach processes (`DATA_GOVERNANCE.md:24`, `DATA_GOVERNANCE.md:25`, `DATA_GOVERNANCE.md:28`, `DATA_GOVERNANCE.md:29`).
- `DESIGN INTENT`: The CR-03 DPIA fact pack independently records that production retention/deletion scheduling, legal-hold workflow, DSAR/correction/deletion workflows, transcript access controls, provider retention, and backup retention remain unknown or missing (`docs/commercial_release/DPIA_FACT_PACK.md:67`, `docs/commercial_release/DPIA_FACT_PACK.md:69`, `docs/commercial_release/DPIA_FACT_PACK.md:75`, `docs/commercial_release/DPIA_FACT_PACK.md:112`, `docs/commercial_release/DPIA_FACT_PACK.md:113`).

## Exact Lifecycle Gaps

- `GAP`: No per-class retention policy model/config is implemented. The schema has data classes and timestamps, but no class-to-retention mapping, effective policy version, or tenant override symbol in `models.py`.
- `GAP`: No production deletion worker exists. `worker.py` supports due jobs, but `_execute_job` only handles `CONTRACTOR_RESPONSE_CHECK`, `AVAILABILITY_CHECK`, and `APPOINTMENT_REMINDER` (`worker.py:59`).
- `GAP`: No legal/operational hold workflow exists for data lifecycle scope. Existing `Approval` records block work-order progression, but there is no hold primitive covering a resident, contractor, user, call session, communication, backup, tenant, or data class.
- `GAP`: No DSAR-grade export exists. `export_csv.py:export_work_orders` exports only work-order rows and omits residents, properties, contractors, communications, call transcripts, call events, audit, action evidence, invoices, approvals, unmatched inbound, and backup/evidence references.
- `GAP`: No correction workflow exists. Voice/Gemini prompts include live-call correction instructions, but the persisted domain model has no reviewed correction request, field-level correction audit, or subject correction API.
- `GAP`: No erasure workflow exists. The only deletion guard found protects active critical-safety records/work orders; there is no deterministic deletion/anonymisation path for closed/cancelled work orders, residents, communications, call transcripts, unmatched inbound, or contractor/user data.
- `GAP`: Backup treatment is incomplete. Backups are byte-for-byte database copies with integrity manifests, but there is no backup retention class, erasure propagation marker, restore quarantine, post-restore deletion replay, or backup destruction evidence.
- `GAP`: Audit preservation rules are incomplete. `AuditEvent.detail` is free text; there is no field-level classification separating immutable operational evidence from personal data that should be redacted, tokenised, or tombstoned.
- `GAP`: Tenant lifecycle isolation is incomplete. Runtime tenant access checks exist, but deletion/export must also prove every query is tenant-scoped and that global identities such as `EvidenceIdentity.fingerprint` do not leak cross-tenant lifecycle decisions.
- `UNKNOWN`: Provider-side retention for Twilio, OpenAI, Gemini, Resend, SMTP/IMAP, managed database, and log providers is not evidenced by source and must remain a contractual/configuration blocker.

## Smallest Reuse Plan

Do not add a new queue, database, scheduler, service, or control plane. Reuse the current database, `AutomationJob`, worker cycle, `claim_action`, `AuditEvent`, `Approval`, `TenantBoundary`, `require_client_resource`, backup manifest, and existing tests.

1. Add lifecycle policy configuration.
   - Store unresolved, named values such as `RETENTION_WORK_ORDER_CLOSED`, `RETENTION_CALL_TRANSCRIPT`, `RETENTION_COMMUNICATION_BODY`, `RETENTION_UNMATCHED_INBOUND`, `RETENTION_CONTRACTOR_PROFILE`, `RETENTION_USER_ACCOUNT`, `RETENTION_AUDIT_MINIMAL`, and `RETENTION_BACKUP_COPY`.
   - Values must be absent/invalid until counsel/business approval; tests should assert the lifecycle worker fails closed when a required class policy is missing.
   - Prefer a committed schema-backed policy table if per-tenant/versioned approval evidence is needed; otherwise a strict environment/config document can feed the same resolver. Either way, no hardcoded periods.

2. Add persistent lifecycle request and hold records in the existing database.
   - Add one lifecycle-hold primitive for `tenant`, `subject`, `work_order`, `call_session`, `communication`, `contractor`, `user`, `backup_set`, and `data_class` scope.
   - Reuse `Approval` only for work-order operational holds; do not stretch it into DSAR/legal scope where there is no work-order.
   - Record actor, reason, scope, start/end, reviewed status, and audit reference. Holds block deletion/anonymisation, but not export.

3. Reuse `AutomationJob` for deterministic lifecycle sweeps.
   - Add one allowlisted job type such as `DATA_LIFECYCLE_SWEEP` inside `_execute_job`.
   - Claim each sweep and each row action with `claim_action` using tenant/class/scope keys so reruns are idempotent.
   - Process in deterministic order by tenant, class, then primary key. Each action writes `AuditEvent` or `CallEvent` when no work order exists.
   - Reschedule the next sweep by inserting another `AutomationJob`; do not add another scheduler.

4. Implement class-specific actions.
   - `export`: gather all records by tenant/subject with allowlisted fields, include transcript/call/communication/action/audit references, and redact secrets.
   - `correction`: create a reviewed request, apply field-level changes only to mutable personal fields, preserve before/after hashes and reviewer audit.
   - `erasure`: delete where safe, otherwise anonymise or tombstone personal fields while preserving non-personal operational evidence, safety state, and minimal audit.
   - `audit preservation`: classify `AuditEvent.detail` and `CallEvent.detail`; move personal detail to erasable/tombstonable payloads where necessary, leaving event type, timestamp, tenant, actor class, and object hash.

5. Treat backups explicitly.
   - Extend backup manifests with policy version, included lifecycle watermark, and backup expiry class.
   - On restore, quarantine restored databases until the lifecycle sweep replays all deletions/erasures after the backup watermark.
   - Record backup destruction evidence with manifest hash and policy version; do not claim erasure from provider-managed backups until provider controls are contractually evidenced.

6. Preserve tenant isolation.
   - Every export, correction, erasure, hold, and sweep query must take explicit `client_id` or a tenant-bound call/session path.
   - Add tests that seed two tenants with identical subject identifiers, action keys, call IDs, and evidence fingerprints; prove one tenant's lifecycle action cannot read or mutate the other.

## Phased Implementation Sequence

1. Policy resolver and fail-closed tests: add configurable data classes with no hardcoded periods; verify missing policy blocks sweep/export/erasure.
2. Lifecycle holds and request ledger: add persistent hold/request records, reviewer audit, and tenant-scoped lookup helpers.
3. Export/DSAR slice: expand from `export_work_orders` into a complete tenant/subject export bundle with deterministic redaction and audit.
4. Correction slice: add reviewed correction for resident/user/contractor/contact/transcript-derived structured fields; immutable audit keeps hashes, not stale personal text.
5. Erasure/anonymisation slice: implement class-specific row actions, critical-safety/hold blockers, tombstones, and audit preservation.
6. Scheduled deletion slice: add `DATA_LIFECYCLE_SWEEP` to `worker.py`, reuse `AutomationJob` leasing/retry/idempotency, and reschedule deterministically.
7. Backup slice: add lifecycle-aware manifest fields, restore quarantine/deletion replay, expiry proof, and provider-backup unknown blockers.
8. Evidence hardening: add tests and release evidence for tenant isolation, idempotency, holds, audit preservation, and backup restore behavior.

## Exact Acceptance Tests

- `test_retention_policy_missing_value_fails_closed`: unset one required class policy and assert the sweep refuses to run and records a blocker without deleting data.
- `test_retention_policy_values_are_configured_not_hardcoded`: configure synthetic periods in test config and assert the resolver uses only supplied values.
- `test_lifecycle_sweep_uses_automation_job_idempotency`: seed duplicate/rerun `DATA_LIFECYCLE_SWEEP` jobs and assert one deletion/anonymisation action per row using `ActionReceipt`.
- `test_lifecycle_sweep_processes_rows_in_deterministic_order`: seed mixed tenants/classes and assert audit/action order is stable by tenant, class, primary key.
- `test_legal_hold_blocks_erasure_but_allows_export`: add a hold on a subject/work order/call and prove erasure is blocked while export still returns held records with hold metadata.
- `test_operational_safety_hold_preserves_critical_records`: active `CriticalSafetyState` and pending safety approvals must prevent destructive lifecycle actions.
- `test_dsar_export_includes_all_subject_classes_for_one_tenant`: prove export includes resident/property/work-order/communication/call/audit/action/evidence/invoice/approval/unmatched-inbound references for the target tenant only.
- `test_dsar_export_rejects_cross_tenant_subject_identifiers`: identical emails/phones/hashes in two tenants must not cross-contaminate export.
- `test_correction_requires_review_and_audits_hashes`: direct correction without approval fails; approved correction records field, actor, reason, old hash, new hash, and timestamp.
- `test_erasure_tombstones_personal_fields_preserves_minimal_audit`: personal fields are removed/anonymised while audit event type/time/tenant/object hash remain.
- `test_call_transcript_erasure_removes_transcript_and_notifications_payload`: `CallSession.transcript`, unmatched inbound body, and derived notification body are erased/tombstoned unless held.
- `test_communication_erasure_hashes_or_removes_body_and_media`: communication bodies/media URLs are treated by class policy while delivery metadata remains minimal.
- `test_backup_manifest_records_lifecycle_policy_and_watermark`: backup manifest includes policy version and lifecycle watermark.
- `test_restore_requires_lifecycle_replay_before_use`: restored backup containing previously erased records remains quarantined until deletion replay completes.
- `test_backup_expiry_records_destruction_evidence`: expired backup deletion records manifest hash, policy version, actor/job id, and timestamp.
- `test_provider_retention_unknown_blocks_commercial_release_evidence`: release readiness remains blocked until provider retention/backup commitments are recorded outside source or explicitly marked unresolved.

## Completion Gate For CR-06

CR-06 is complete when this evidence-backed gap/reuse plan is accepted. The implementation and executable tests remain work for CR-11 and CR-13. Until those later slices pass, the product state remains: `IMPLEMENTED FACT` for core storage, tenant checks, jobs, idempotency, audit, local backup, and work-order export; `GAP` for production data lifecycle controls; `UNKNOWN` for provider-side retention and contractual backup behaviour.

# CR-03L — Local-model factual data inventory draft

Status: **DRAFT INPUT COMPLETE — requires CR-03 source verification**

Purpose: use the existing Chapelgate local model only for bounded factual structuring. This document is not a DPIA, legal opinion, lawful-basis decision, retention policy, or compliance approval.

## Execution evidence

- Local model store reused: `C:\Users\Andy\colibri\ollama-models`
- Model used: `ibm/granite4:tiny-h-q2_K`
- Isolated Ollama port: `127.0.0.1:8914`
- One model at a time; `keep_alive=0`; small context/prediction limits.
- Initial large combined prompt caused a connection reset and was rejected.
- Smaller source-bounded passes succeeded.
- A later provider-name pass degraded into generic/nonresponsive text and was rejected; no provider facts from that pass are used below.
- Canonical source supplied to accepted passes: `DATA_GOVERNANCE.md` and `ARCHITECTURE.md`.

## Accepted local-model extraction — governance facts

### Explicit data classes found

- Resident identity/contact and verification attempts.
- Property address, access and emergency notes.
- Repair descriptions, safety flags, photos/evidence, communications, and audit.
- Call metadata, transcript, model/provider identifiers, and action evidence.
- Contractor identity, qualifications, insurance, performance, quote, and invoice information.
- Staff identity, role, approvals, overrides, and security events.

### Explicit retention/deletion facts found

- Retention is to be defined per data class and legal/operational hold.
- Scheduled deletion must be implemented and independently tested before real data.
- Safety and audit records are preserved when an incident/complaint hold applies.
- An ordinary deletion request must not silently destroy required evidence.
- The current build does not yet implement a production retention/deletion scheduler, legal-hold workflow, or external evidence store; the canonical governance document marks these as production blockers.

## Accepted local-model extraction — architecture facts

- `api.py`: HTTP/WebSocket application and authenticated internal operations.
- `dashboard.py`: human supervisor interface and remains usable without AI services.
- `worker.py`: leased durable jobs, bounded retries, stale recovery and escalation.
- `readiness.py` / `schema_health.py`: fail-closed configuration and schema checks.
- `backup_restore.py`: local SQLite backup, verification and non-overwriting restore.
- `decision_engine.py`: deterministic safety classification before workflow logic.
- `voice_policy.py`: rejects unsafe model actions/outputs.
- `voice_bridge.py`: buffers model audio until the complete transcript passes voice policy.
- `action_evidence.py`: records requested/pending/attempted/failed/succeeded action states; verified successful domain evidence is required before affirmative claims.
- `tenant_security.py`: binds internal/voice operations to one client.

## Explicit handoff / unknowns for CR-03

CR-03 must verify directly from canonical source and runtime evidence:

- exact external provider/interface list and what data each receives;
- exact database/table/storage locations for every data class;
- production backup destinations and deletion behaviour;
- transcript/audio persistence behaviour versus transient processing;
- email/messaging payload contents and stores;
- telemetry/logging destinations and redaction;
- exact export/DSAR surfaces;
- current production implementation status rather than design intent.

Provider extraction is intentionally left **UNKNOWN** here because the local-model provider pass failed quality review. CR-03 must not promote any local-model inference into the DPIA fact pack without source evidence.

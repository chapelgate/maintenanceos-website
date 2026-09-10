# Architecture Overview

## Trust Boundaries

1. FastAPI accepts internal API calls and signed provider callbacks.
2. `tenant_security.py` binds every internal/voice operation to one client.
3. `decision_engine.py` deterministically classifies safety before workflow logic.
4. `safety_controls.py`, `lifecycle.py`, and the SQLAlchemy `before_flush` invariant
   enforce monotonic critical state and valid transitions for every ORM write path.
5. `operations.py` owns contractor, approval, appointment, quote, invoice,
   completion, cancellation, and closure operations.
6. `idempotency.py`, database unique constraints, and `worker.py` control retries
   and concurrent consequential work.
7. `action_evidence.py` records requested/pending/attempted/failed/succeeded states.
   Only verified successful domain evidence can authorise an affirmative claim.
8. `voice_policy.py` rejects unsafe model actions and outputs. `voice_bridge.py`
   buffers model audio until the complete transcript passes that policy.

## Critical-Safety Invariant

An active critical latch forces `HUMAN_REVIEW`, `P1`, and preserved safety flags.
Caller minimisation, model output, resident confirmation, contractor action,
approval, quote, invoice, completion, closure, retry, or direct ORM mutation cannot
clear or progress it. Clearance requires an authorised human role, substantive
reason, audit event, and post-clearance review approval.

## Runtime Components

- `api.py`: HTTP/WebSocket application and authenticated internal operations.
- `dashboard.py`: human supervisor interface; remains usable without AI services.
- `worker.py`: leased durable jobs, bounded retries, stale recovery, escalation.
- `communications.py`: local delivery ledger; no external send in local mode.
- `readiness.py` and `schema_health.py`: fail-closed configuration and schema checks.
- `backup_restore.py`: local SQLite backup, verification, and non-overwriting restore.

## Deployment Shape

The intended test environment has separate API and worker processes, managed
PostgreSQL, private secret injection, TLS ingress, restricted administration, and
central logs/alerts. Public voice ingress and provider credentials are staged-only
approval boundaries. Production needs migration rehearsal, load/concurrency tests,
retention implementation, monitoring, and professional policy review.

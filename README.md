# MaintenanceOS V1 Pilot

MaintenanceOS is a local, multi-tenant maintenance-operations pilot. Deterministic
server rules own safety, lifecycle, tenant isolation, approvals, and financial
prohibitions. AI may help collect and classify information, but it is not the
authority for safety or consequential actions.

## Implemented Locally

- Tenant-scoped properties, residents, contractors, work orders, links, exports,
  background jobs, communications, action evidence, and call sessions.
- Central lifecycle transitions, critical-safety latching, authorised human
  clearance, audit events, escalation queues, approvals, contractor operations,
  quote/invoice checks, completion, confirmation, cancellation, reopening, and
  no-show handling.
- Deterministic emergency detection for gas, fire/smoke, CO, dangerous electrics,
  water with electrics, major flooding, structural danger, entrapment, threats,
  and safeguarding.
- Voice output interception that buffers an entire model audio response until its
  transcript passes privacy, safety, finance, and verified-action checks.
- Durable retries, idempotency constraints, dead-letter escalation, schema
  readiness checks, and verified local SQLite backup/restore tooling.
- A Streamlit supervisor dashboard, FastAPI application, worker, unit/integration
  tests, and a local acceptance harness.

No payment, refund, compensation, fee-waiver, or client-money execution exists.
No successful live Twilio/OpenAI call has yet been demonstrated.

## Local Start

Use the existing virtual environment when valid:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn api:app --host 127.0.0.1 --port 8000
.\.venv\Scripts\python.exe worker.py
.\.venv\Scripts\python.exe -m streamlit run dashboard.py
```

Keep `ENABLE_REALTIME_VOICE=false` for local operation. Do not copy `.env.example`
over an existing `.env`, and never commit `.env`.

## Local Acceptance Evidence

Use the local acceptance runner to capture a timestamped source manifest, test
output, readiness output, and SQLite backup/restore evidence without contacting
external providers:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run_local_acceptance.ps1
```

The runner fails closed if the local Python interpreter cannot start. On
2026-09-10 it was blocked before tests by the virtualenv launcher referencing
`C:\Users\Andy\AppData\Local\Programs\Python\Python313\python.exe`, which is not
executable in this sandbox.

## Backup And Restore

```powershell
.\.venv\Scripts\python.exe backup_restore.py backup evidence\backup.db
.\.venv\Scripts\python.exe backup_restore.py verify evidence\backup.db
.\.venv\Scripts\python.exe backup_restore.py restore evidence\backup.db restored.db
```

Restore refuses an existing destination and verifies the manifest hash, SQLite
integrity, foreign keys, and required schema before writing a restored database.
Managed PostgreSQL requires provider-native backup and restore rehearsal.

## Evidence Boundary

Local mocks prove local policy and protocol handling only. They do not prove
carrier delivery, public ingress, real webhook signatures, live audio quality,
transcription timing, model availability, human transfer, or provider callbacks.
Scenarios 91-100 are withheld and must not be inspected or used.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY_DEPLOYMENT.md](SECURITY_DEPLOYMENT.md),
[DATA_GOVERNANCE.md](DATA_GOVERNANCE.md), and
[STAGED_VOICE_INTEGRATION.md](STAGED_VOICE_INTEGRATION.md).

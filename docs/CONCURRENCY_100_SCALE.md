"""100-call concurrency architecture for MaintenanceOS.

## Target

One public telephone number → up to 100 simultaneous independent AI conversations
(configurable ceiling above 100). Callers never see each other. Strict
tenant/call isolation. Horizontal scale beyond a single instance.

## What the code does now

1. **Admission control** (`call_capacity.py`)
   - `GLOBAL_MAX_CONCURRENT_CALLS` (default 100)
   - `PER_CLIENT_MAX_CONCURRENT_CALLS` (default 100)
   - Process-local leases with idempotent re-acquire
   - Stale lease expiry helpers for worker failure recovery
   - Wired at `/voice/inbound` (reject with busy TwiML) and released on
     `close_call_session`

2. **Simulated ladder** (`concurrency_loadtest.py`)
   - Levels: 1, 5, 12, 25, 50, 75, 100
   - No real Twilio / model spend
   - Measures accept/reject, latency, CPU, RSS, isolation, tenant binding

3. **Health**
   - `/health` exposes active call count and capacity limits (no secrets)

## Horizontal scale (add only when tests prove need)

| Component | When required | Notes |
| --- | --- | --- |
| Multiple API instances behind LB | CPU/RAM or FD limits on one box | Prefer **sticky WS** or route Stream URL to one pool |
| Shared capacity backend (Redis) | Multi-instance global count | Interface reserved; default remains process-local |
| PostgreSQL + pooling | SQLite lock contention under write load | Production path already uses Postgres option |
| Autoscaling | Sustained high active_calls | Scale on `active_calls` / WS count / CPU |
| Queue for post-call work | Email/DB spikes after hangup | Existing `worker.py` durable jobs |
| Per-company caps | Noisy neighbour | Already in capacity controller |

Do **not** introduce Redis/Kafka/etc. merely for fashion. The ladder identifies
the bottleneck class first.

## Known single-instance bottlenecks to validate

- Twilio account concurrent-call limits (provider)
- Gemini / OpenAI realtime session quotas (provider)
- `PUBLIC_WS_RATE_LIMIT_PER_MINUTE` / HTTP ingress limits (app config)
- One uvicorn worker FD/CPU (app process)
- SQLite write lock (database) — not for production concurrency
- In-memory `_ACTIVE_CALL_SESSIONS` (per process only; DB is source of truth)

## Simulated ladder evidence (this branch)

Command: `python concurrency_loadtest.py`

Progressive PASS with simultaneous peak == target:

| Level | Result |
| --- | --- |
| 1 | PASS |
| 5 | PASS |
| 12 | PASS |
| 25 | PASS |
| 50 | PASS |
| 75 | PASS |
| 100 | PASS — 100 independent call IDs/sessions/transcripts, no cross-leak |

Next (not done here): smallest real telephony concurrency probe after simulated PASS.
Do **not** run 100 chargeable live calls.
"""

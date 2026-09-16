"""100-call concurrency architecture for MaintenanceOS.

## Target

One public telephone number → up to 100 simultaneous independent AI conversations
(configurable ceiling above 100). Callers never see each other. Strict
tenant/call isolation. Horizontal scale beyond a single instance.

Final product shape:

- ONE NUMBER → 100+ simultaneous AI callers
- Multiple numbers per company
- Multiple companies
- Strict tenant/call isolation
- Live supervisor dashboard (existing path; capacity shown on `/health`)
- Human takeover/escalation (existing Dial-on-explicit-request path)
- Horizontal scaling when tests prove need

## What the code does now

1. **Admission control** (`call_capacity.py`)
   - `GLOBAL_MAX_CONCURRENT_CALLS` (default 100, raise for headroom)
   - `PER_CLIENT_MAX_CONCURRENT_CALLS` (default 100)
   - Process-local leases with idempotent re-acquire (webhook retries safe)
   - Stale lease expiry for dead-worker recovery (`expire_stale_leases`)
   - Graceful drain (`set_capacity_draining`) — reject new calls, finish active
   - Cost-protection signal: `estimated_hourly_burn_usd` on snapshots
   - Wired at `/voice/inbound` (busy TwiML on reject); released on `close_call_session`

2. **Simulated ladder** (`concurrency_loadtest.py`)
   - Levels: 1, 5, 12, 25, 50, 75, 100
   - No real Twilio / model spend
   - Claims capacity leases + **independent mock AI context IDs** + in-process media slots
   - Full-cohort transcript isolation (not adjacent-only)
   - Gate scope is explicitly `simulated_admission_db_and_mock_ai_contexts`
     (`live_media_exercised=false`) — does **not** claim live Twilio media or provider sockets

3. **HTTP telephony-path probe** (`telephony_path_concurrency_probe.py`)
   - Signed synthetic `/voice/inbound` concurrency (still zero carrier/model spend)
   - Progressive levels 1 → 5 → 12 before any live calls

4. **Health**
   - `/health` exposes active call count, limits, drain state, utilisation,
     estimated hourly burn (no secrets)

## Horizontal scale (add only when tests prove need)

| Component | When required | Notes |
| --- | --- | --- |
| Multiple API instances behind LB | CPU/RAM or FD limits on one box | Prefer **sticky WS** or route Stream URL to one pool |
| Shared capacity backend (Redis) | Multi-instance global count | Interface reserved; default remains process-local |
| PostgreSQL + pooling | SQLite lock contention under write load | Production path already uses Postgres option |
| Autoscaling | Sustained high `active_calls` | Scale on `active_calls` / WS count / CPU |
| Queue for post-call work | Email/DB spikes after hangup | Existing `worker.py` durable jobs |
| Per-company caps | Noisy neighbour | Already in capacity controller |
| Graceful draining | Deploy / scale-in | `set_capacity_draining(True)` |

Do **not** introduce Redis/Kafka/etc. merely for fashion. Classify the bottleneck
first, then add the matching component.

## Bottleneck classes

When a gate fails (or a live probe is blocked), record exactly one class:

| Class | Typical signal | Scaling response |
| --- | --- | --- |
| telephony_provider_account | Twilio concurrent-call / CPS errors | Account limit raise; extra numbers only if product needs |
| openai_realtime_or_gemini_quota | Provider 429 / session cap | Multi-key pool or provider quota increase |
| application_architecture | Admission bugs, session cross-talk | Fix code; do not add infra |
| cpu_ram | High loadavg / OOM at N < 100 | More instances + sticky WS |
| websocket_connections | FD / WS accept failures | Raise ulimit; more instances |
| networking | Timeouts, reset storms | Edge tuning / region |
| database | Lock / pool exhaustion | Postgres + pool sizing |
| queue | Post-call job backlog | More workers |
| worker_count | Automation lag only | Scale `worker.py` replicas |
| rate_limits | App `PUBLIC_WS_RATE_*` rejects | Raise config (already 300 default for 100 streams) |

## Horizontal scale beyond 100 (design only — do not provision spend to demo)

| Concurrent sessions | Likely first limiter | Add only when measured |
| --- | --- | --- |
| 100 | App admission + provider quotas | Current process-local design |
| 250 | Single-process CPU/FD or provider session caps | 2–3 app instances + sticky WS; shared capacity backend |
| 500 | DB pool + post-call workers + provider CPS | Postgres pool sizing; more workers; quota raise |
| 1,000+ | Multi-region / multi-account telephony + model fan-out | LB pools; per-pool capacity; cost kill-switch |

Do **not** spend to prove 250/500/1000 in this iteration. Document the scaling seam; keep Redis optional until multi-instance tests fail without it.

## Simulated ladder evidence (this branch)

Command: `python3 concurrency_loadtest.py`

Progressive PASS with simultaneous peak == target (session/transcript isolation + recovery).

| Level | Result |
| --- | --- |
| 1 | PASS |
| 5 | PASS |
| 12 | PASS |
| 25 | PASS |
| 50 | PASS |
| 75 | PASS |
| 100 | PASS — 100 independent call IDs/sessions/transcripts, no cross-leak |

Command: `python3 telephony_path_concurrency_probe.py` → HTTP path 1/5/12.

Evidence pack: `python3 scripts/build_concurrency_evidence_pack.py` → `docs/concurrency_100_evidence/`.

## Smallest real-world concurrency probe (chargeable)

**Do not run 100 real calls.**

After simulated + HTTP-path PASS on an isolated controlled-call deploy:

1. **N=2 simultaneous live calls** on the dedicated test number (two handsets / two PSTN legs).
2. Assert: two CallSids, two call_session rows, two transcripts, correct tenant binding, no cross-leak, clean hangup, `/health.active_calls` returns to 0.
3. Optional stretch: **N=3** only if N=2 is clean and Andrew authorises the extra spend.
4. Stop. Provider quotas (Twilio concurrent + Gemini/OpenAI realtime) are the next bottleneck class to validate with account dashboards — not with a 100-call bill.

## 100-call acceptance gate (simulated)

PASS only when controlled simulation shows:

- 100 simultaneous incoming calls
- 100 independent call IDs
- 100 independent AI/session contexts
- 100 independent transcripts
- correct caller-to-session mapping
- correct tenant/company mapping
- no cross-call data leakage
- no lost calls
- no duplicate jobs/actions
- stable database behaviour
- acceptable latency
- clean session termination
- correct post-call records
- recovery: stale orphan lease expires without harming others

Live 100-call PASS is deferred until provider quotas and cost controls are proven; the **design target remains 100+**.

## Isolation from stable production

This work stays on branch `cursor/concurrency-100-scale-d1b9` / PR until existing
tests and the concurrency gates above PASS. Do not flip production
`GLOBAL_MAX_CONCURRENT_CALLS` or open public ingress for load tests without an
explicit controlled-call window.
"""

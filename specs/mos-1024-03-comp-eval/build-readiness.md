# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: `APPLIES`, `NOT_APPLICABLE` or `ALREADY_COVERED`. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: process-local strip/eval bridge with no HTTP, network client, timeout, retry, or health endpoint surface.
(rate limiting, timeouts, retries, backoff, idempotency, circuit breakers, backpressure, health checks, failover)

## 2. Performance
Status: NOT_APPLICABLE
Reason: no user-facing runtime path, caching, CDN, indexing, or query work; synchronous strip-and-eval helpers only.
(caching, CDN, load balancing, indexing, query optimisation, N+1, connection pooling, latency, cold starts)

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no migrations, schema changes, database writes, or stored state; strip/eval computed from input dict only.
(migrations, schema versioning, backups, disaster recovery, replication, locking, race conditions, deadlocks)

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no queues, pub/sub, cron, webhooks, or websockets; synchronous helpers only.
(queues, dead letter queues, pub/sub, cron jobs, webhooks, websockets)

## 5. Security
Status: APPLIES
Reason: input allowlist before eval; returned facts drop conclusion, deadline, free text, and date strings; covered by tests/test_landlord_compliance_bridge.py.
(secrets management, least privilege, auth, TLS, encryption, CORS, CSRF, injection, XSS, SSRF)

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1024-03-comp-eval/; draft PR on readiness/mos-1024-03-comp-eval; rollback by deleting new bridge, vertical_profile, tests, specs folder; no new dependencies.
(CI/CD, containers, feature flags, staged deployment, rollback, versioning, infrastructure as code, dependencies)

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs; returns facts dict or raises typed error without production telemetry.
(logging, metrics, alerts, tracing, SLOs, cost, incident response, post-mortems)

## 8. Runtime hygiene
Status: APPLIES
Reason: vertical-off path never imports landlordos (import tracker test); missing pin returns False without crash; non-dict result raises typed error.
(memory leaks, thread safety, clock skew, DNS, protocols)

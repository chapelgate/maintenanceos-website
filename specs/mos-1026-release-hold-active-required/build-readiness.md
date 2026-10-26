# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed release_hold guard before mutation; already-released holds refuse without audit side effects.
(rate limiting, timeouts, retries, backoff, idempotency, circuit breakers, backpressure, health checks, failover)

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early boolean check on an existing hold path; no new queries, caches, or indexes.
(caching, CDN, load balancing, indexing, query optimisation, N+1, connection pooling, latency, cold starts)

## 3. Data and consistency
Status: APPLIES
Reason: refuses release of inactive holds before clearing active or writing audit; no schema or migration change.
(migrations, schema versioning, backups, disaster recovery, replication, locking, race conditions, deadlocks)

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: synchronous release_hold path only; no new queues or workers.
(queues, dead letter queues, pub/sub, cron jobs, webhooks, websockets)

## 5. Security
Status: APPLIES
Reason: tenant-scoped hold lookup retained; blank actor still refused by release_hold_actor_required from main.
(secrets management, least privilege, auth, TLS, encryption, CORS, CSRF, injection, XSS, SSRF)

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1026-release-hold-active-required/; draft PR; rollback by reverting the guard and deleting the new test and specs folder.
(CI/CD, containers, feature flags, staged deployment, rollback, versioning, infrastructure as code, dependencies)

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs; raises existing LifecycleRuntimeError only.
(logging, metrics, alerts, tracing, SLOs, cost, incident response, post-mortems)

## 8. Runtime hygiene
Status: APPLIES
Reason: inactive holds raise hold_already_released before mutation; active path still audits once.
(memory leaks, thread safety, clock skew, DNS, protocols)

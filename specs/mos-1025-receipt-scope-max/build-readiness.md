# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed input guard before mutation; existing worker path unchanged.
(rate limiting, timeouts, retries, backoff, idempotency, circuit breakers, backpressure, health checks, failover)

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early string or membership check; no new queries, caches, or indexes.
(caching, CDN, load balancing, indexing, query optimisation, N+1, connection pooling, latency, cold starts)

## 3. Data and consistency
Status: APPLIES
Reason: refuses invalid inputs before tenant-scoped mutation; no schema or migration change.
(migrations, schema versioning, backups, disaster recovery, replication, locking, race conditions, deadlocks)

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing queues and paths without new topics.
(queues, dead letter queues, pub/sub, cron jobs, webhooks, websockets)

## 5. Security
Status: APPLIES
Reason: fail-closed input locks reduce invalid mutation risk; covered by dedicated pytest module.
(secrets management, least privilege, auth, TLS, encryption, CORS, CSRF, injection, XSS, SSRF)

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1025-receipt-scope-max/; draft PR; rollback by reverting the guard and deleting the new test and specs folder.
(CI/CD, containers, feature flags, staged deployment, rollback, versioning, infrastructure as code, dependencies)

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs beyond existing typed errors.
(logging, metrics, alerts, tracing, SLOs, cost, incident response, post-mortems)

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid inputs raise typed errors before claim_action or mutation.
(memory leaks, thread safety, clock skew, DNS, protocols)

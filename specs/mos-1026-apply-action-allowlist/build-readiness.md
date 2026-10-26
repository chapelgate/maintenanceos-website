# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed lifecycle guard before claim_action or mutation; idempotency key formation stays behind the guard.
(rate limiting, timeouts, retries, backoff, idempotency, circuit breakers, backpressure, health checks, failover)

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early string or membership check on an existing worker path; no new queries, caches, or indexes.
(caching, CDN, load balancing, indexing, query optimisation, N+1, connection pooling, latency, cold starts)

## 3. Data and consistency
Status: APPLIES
Reason: refuses invalid lifecycle decisions before any tenant-scoped mutation; no schema or migration change.
(migrations, schema versioning, backups, disaster recovery, replication, locking, race conditions, deadlocks)

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing AutomationJob DATA_LIFECYCLE_SWEEP queue and ActionReceipt claim path without new topics.
(queues, dead letter queues, pub/sub, cron jobs, webhooks, websockets)

## 5. Security
Status: APPLIES
Reason: tenant and input fail-closed locks reduce cross-tenant and blank-field mutation risk; covered by dedicated pytest module.
(secrets management, least privilege, auth, TLS, encryption, CORS, CSRF, injection, XSS, SSRF)

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1026-apply-action-allowlist/; draft PR on readiness/mos-1026-apply-action-allowlist; rollback by reverting the guard and deleting the new test and specs folder; no new dependencies.
(CI/CD, containers, feature flags, staged deployment, rollback, versioning, infrastructure as code, dependencies)

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs; raises existing LifecycleRuntimeError only.
(logging, metrics, alerts, tracing, SLOs, cost, incident response, post-mortems)

## 8. Runtime hygiene
Status: APPLIES
Reason: blank or unsupported inputs raise typed LifecycleRuntimeError before claim_action; retain path short-circuits unchanged.
(memory leaks, thread safety, clock skew, DNS, protocols)

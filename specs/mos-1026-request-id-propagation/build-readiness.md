# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: HttpSecurityBoundary already generates x-request-id; this slice only propagates that id into audit and logs without changing rate limits.
(rate limiting, timeouts, retries, backoff, idempotency, circuit breakers, backpressure, health checks, failover)

## 2. Performance
Status: NOT_APPLICABLE
Reason: contextvar get/set and optional JSON parse of audit detail only; no new queries or caches.
(caching, CDN, load balancing, indexing, query optimisation, N+1, connection pooling, latency, cold starts)

## 3. Data and consistency
Status: APPLIES
Reason: audit detail JSON may gain request_id key when context is set; no schema migration; redact_detail still runs on the string.
(migrations, schema versioning, backups, disaster recovery, replication, locking, race conditions, deadlocks)

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no new queues or workers; HTTP request context only for the request lifetime.
(queues, dead letter queues, pub/sub, cron jobs, webhooks, websockets)

## 5. Security
Status: APPLIES
Reason: request_id stays on the SAFE_EVENT_FIELDS allowlist; audit still passes through redact_detail; never overrides caller-supplied request_id keys.
(secrets management, least privilege, auth, TLS, encryption, CORS, CSRF, injection, XSS, SSRF)

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1026-request-id-propagation/; draft PR; rollback by reverting the four files and deleting the new module/tests/specs.
(CI/CD, containers, feature flags, staged deployment, rollback, versioning, infrastructure as code, dependencies)

## 7. Operations
Status: APPLIES
Reason: closes INCIDENT_OBSERVABILITY_MATRIX request_id propagation GAP for HTTP audit and structured logs.
(logging, metrics, alerts, tracing, SLOs, cost, incident response, post-mortems)

## 8. Runtime hygiene
Status: APPLIES
Reason: clear_request_id in HttpSecurityBoundary finally; malformed JSON audit detail left unchanged.
(memory leaks, thread safety, clock skew, DNS, protocols)

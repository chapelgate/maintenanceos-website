# Assessment — mos-1188 correlation_id on all HTTP responses

## Symptom
/health returns x-correlation-id (and body correlation_id), but error and non-health responses only carry x-request-id. Probe: GET /no-such → 404 with x-request-id only; POST /work-orders unauth → 503 with x-request-id only.

## Root cause
ingress_security.HttpSecurityBoundary.secured_send appends x-request-id for every response but never emits x-correlation-id. Health sets the header locally; other paths do not.

## Class
BUG (incomplete observability correlation after mos-1084)

## Acceptance
- Every HTTP response includes x-correlation-id equal to x-request-id
- Supplied valid x-request-id propagates to both headers
- Health body correlation_id still matches both headers
- No frozen paths touched

# Assessment — mos-1194 metrics correlation_id

## Symptom
/health returns correlation_id in the JSON body; /metrics does not, so operators cannot join metrics samples to request logs/headers.

## Root cause
metrics_endpoint returns operational_metrics(...) verbatim without attaching request_id.

## Class
BUG (incomplete correlation after mos-1084/1188/1190)

## Acceptance
- /metrics JSON includes correlation_id equal to request context when present
- reporting.OPERATIONAL_METRICS_FIELDS allowlist unchanged (API layer only)
- Observability suites stay green

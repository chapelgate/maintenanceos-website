# Assessment — mos-1195 readiness correlation_id

## Symptom
/health and (pending) /metrics expose correlation_id; /readiness does not, so gate samples cannot join request logs/headers.

## Root cause
readiness_endpoint returns readiness_report() verbatim without attaching request_id.

## Class
BUG (incomplete correlation after mos-1084/1188/1190/1194)

## Acceptance
- /readiness JSON includes correlation_id equal to request context when present
- readiness.report() boolean payload unchanged at module level
- readiness/profile suites stay green

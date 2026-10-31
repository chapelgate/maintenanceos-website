# Assessment — mos-1190 error body correlation_id

## Symptom
Sanitized HTTPException JSON returns only {"detail": ...}. Clients cannot correlate error bodies with x-request-id / x-correlation-id without reading headers.

## Root cause
api._sanitize_http_exception builds JSON content with detail only (HTML contractor branch already ships role=alert).

## Class
BUG (incomplete correlation after mos-1084/1188; rebase after #626 HTML alert merge)

## Acceptance
- Error JSON includes correlation_id equal to request_id context when present
- detail remains sanitized; contractor HTML alert path unchanged
- Related suites stay green

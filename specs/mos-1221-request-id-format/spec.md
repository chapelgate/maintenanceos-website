# mos-1221-request-id-format
FEATURE: bound and sanitize set_request_id inputs

## What
set_request_id accepts any string into contextvars; control characters or overlong IDs can propagate into logs/audit.

## Acceptance
- REQUEST_ID_MAX=128
- Control characters stripped/rejected (store empty on invalid)
- Empty/None clears as today
- Existing request_id propagation suites stay green

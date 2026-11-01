# mos-1203-invalid-link-event
FEATURE: emit operational_event when contractor portal link verification fails

## What
Portal handlers raise HTTP 403 "Invalid link" with no dedicated operational event.

## Acceptance
- Before raising Invalid link on decision/availability/complete GET+POST paths, emit operational_event("invalid_link", ...)
- Fields: request_id/method/path/status/action only (token values never logged)
- Existing portal link suites stay green

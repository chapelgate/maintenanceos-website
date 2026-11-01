# mos-1202-csrf-rejected-event
FEATURE: emit operational_event when contractor portal CSRF verification fails

## What
Portal POST handlers raise HTTP 403 "Invalid CSRF token" with no dedicated operational event.

## Acceptance
- Before raising Invalid CSRF token on decision/availability/complete submit, emit operational_event("csrf_rejected", ...)
- Fields: request_id/method/path/status/action only
- Existing CSRF suites stay green

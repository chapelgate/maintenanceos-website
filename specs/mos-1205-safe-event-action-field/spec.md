# mos-1205-safe-event-action-field
FEATURE: allow action in SAFE_EVENT_FIELDS for portal auth observability

## What
Portal csrf_rejected / invalid_link events emit action=, but RedactedJsonFormatter drops keys not in SAFE_EVENT_FIELDS, so action never reaches structured logs.

## Acceptance
- "action" is in SAFE_EVENT_FIELDS
- Formatter keeps a short non-secret action string
- Sensitive keys stay excluded
- Existing operational logging suites stay green

# mos-1037-error-handling

## Goal
Add a fail-closed `error_event` helper that emits only SAFE_EVENT_FIELDS and never secret-shaped keys.

## Acceptance
- test_event_no_secret_fields
- test_log_event_valid_fields
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, central monitoring.

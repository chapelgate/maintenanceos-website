# mos-1237-safety-status-control-chars
FEATURE: reject control characters in assert_status_change_allowed new_status

## What
assert_status_change_allowed accepts new_status strings without control-char validation.

## Acceptance
- assert_status_change_allowed raises SafetyStateError on control chars in new_status
- Existing safety tests stay green

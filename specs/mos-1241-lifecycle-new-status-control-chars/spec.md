# mos-1241-lifecycle-new-status-control-chars
FEATURE: reject control characters in lifecycle new_status transition target

## What
transition_work_order validates actor/reason for control chars but not new_status.

## Acceptance
- transition_work_order raises ValueError on control chars in new_status
- Existing lifecycle tests stay green

# mos-1299-call-notifications-del-c1

## Goal
call_notifications._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- extract_call_details returns empty dict on DEL/C1 in transcript
- Existing C0 reject suite remains green

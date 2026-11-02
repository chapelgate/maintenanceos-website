# mos-1291-safety-controls-del-c1

## Goal
safety_controls latch actor, clearance reason, and assert_status_change_allowed must reject DEL (U+007F) and C1 controls (U+0080–U+009F) while keeping tab/newline/CR allowed.

## Acceptance
- latch_critical_safety / clear_critical_safety / assert_status_change_allowed raise on DEL and C1
- Existing C0 reject + clean accept remain green

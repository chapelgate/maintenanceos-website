# mos-1287-lifecycle-del-c1

## Goal
lifecycle.transition_work_order must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in new_status, actor, and reason, while keeping tab/newline/CR allowed.

## Acceptance
- transition_work_order raises on DEL and C1 in new_status/actor/reason
- Clean transitions still succeed
- Existing C0 reject suite remains green

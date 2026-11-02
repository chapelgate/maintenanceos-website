# mos-1296-call-capacity-del-c1

## Goal
call_capacity._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- try_acquire rejects DEL and C1 in call_sid/worker_id
- Existing C0 reject suite remains green

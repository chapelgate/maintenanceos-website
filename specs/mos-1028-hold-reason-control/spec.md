# mos-1028-hold-reason-control

## Goal
Data-lifecycle hold reason/actor/scope_id and release actor reject control characters.

## Acceptance
- create_hold and release_hold call reason_has_control_chars
- overlong/control inputs raise LifecycleRuntimeError("hold_control_chars")
- tests pass

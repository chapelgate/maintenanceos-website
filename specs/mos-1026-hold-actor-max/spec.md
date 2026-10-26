# mos-1026-hold-actor-max: lifecycle hold actor stays at most 100 characters

## Goal
create_hold actor values are stripped and at most HOLD_ACTOR_MAX (100) characters, matching DataLifecycleHold.created_by String(100). Overlong actors fail closed with LifecycleRuntimeError before the hold row is written.

## Acceptance
- `tests/test_hold_actor_max.py::test_hold_actor_max_is_100` passes.
- `tests/test_hold_actor_max.py::test_hold_actor_accepts_bounded_text` passes.
- `tests/test_hold_actor_max.py::test_hold_actor_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

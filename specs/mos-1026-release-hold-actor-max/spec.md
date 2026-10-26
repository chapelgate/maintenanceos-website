# mos-1026-release-hold-actor-max: release_hold actor stays at most 100 characters

## Goal
release_hold actor values are stripped (empty becomes "Lifecycle Controller") and at most RELEASE_HOLD_ACTOR_MAX (100) characters, matching String(100) actor fields. Overlong actors fail closed with LifecycleRuntimeError before the hold is released.

## Acceptance
- `tests/test_release_hold_actor_max.py::test_release_hold_actor_max_is_100` passes.
- `tests/test_release_hold_actor_max.py::test_release_hold_actor_accepts_bounded_text` passes.
- `tests/test_release_hold_actor_max.py::test_release_hold_actor_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

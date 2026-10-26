# mos-1026-release-hold-actor-required: release_hold actors stay non-empty

## Goal
release_hold strips actor and refuses a blank value with LifecycleRuntimeError before mutating the hold. Released holds always carry an explicit actor; no silent "Lifecycle Controller" fallback.

## Acceptance
- `tests/test_release_hold_actor_required.py::test_release_requires_non_empty_actor` passes.
- `tests/test_release_hold_actor_required.py::test_release_accepts_stripped_actor` passes.
- `tests/test_release_hold_actor_required.py::test_release_rejects_whitespace_actor` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

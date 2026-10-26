# mos-1026-hold-scope-id-max: lifecycle hold scope_id stays at most 200 characters

## Goal
create_hold scope_id values are stripped and at most SCOPE_ID_MAX (200) characters, matching DataLifecycleHold.scope_id String(200). Overlong scope ids fail closed with LifecycleRuntimeError before the hold row is written.

## Acceptance
- `tests/test_hold_scope_id_max.py::test_hold_scope_id_max_is_200` passes.
- `tests/test_hold_scope_id_max.py::test_hold_scope_id_accepts_bounded_text` passes.
- `tests/test_hold_scope_id_max.py::test_hold_scope_id_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false. Retention durations stay Andy-gated; this only bounds the identifier length.

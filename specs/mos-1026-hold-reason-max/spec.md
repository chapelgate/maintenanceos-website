# mos-1026-hold-reason-max: lifecycle hold reason stays at most 1000 characters

## Goal
create_hold reason values are stripped and at most HOLD_REASON_MAX (1000) characters. Overlong reasons fail closed with LifecycleRuntimeError before the hold row is written.

## Acceptance
- `tests/test_hold_reason_max.py::test_hold_reason_max_is_1000` passes.
- `tests/test_hold_reason_max.py::test_hold_reason_accepts_bounded_text` passes.
- `tests/test_hold_reason_max.py::test_hold_reason_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false. Retention durations stay Andy-gated; this only bounds reason length.

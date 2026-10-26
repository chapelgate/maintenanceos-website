# mos-1026-sweep-reason-max: retention sweep reason stays at most 1000 characters

## Goal
queue_retention_sweep reason values are stripped and at most SWEEP_REASON_MAX (1000) characters, matching other lifecycle reason caps. Overlong reasons fail closed with LifecycleRuntimeError before the request row is written.

## Acceptance
- `tests/test_sweep_reason_max.py::test_sweep_reason_max_is_1000` passes.
- `tests/test_sweep_reason_max.py::test_sweep_reason_accepts_bounded_text` passes.
- `tests/test_sweep_reason_max.py::test_sweep_reason_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

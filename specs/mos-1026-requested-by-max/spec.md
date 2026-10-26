# mos-1026-requested-by-max: retention sweep requested_by stays at most 100 characters

## Goal
queue_retention_sweep actor values (stored as DataLifecycleRequest.requested_by) are stripped and at most REQUESTED_BY_MAX (100) characters, matching String(100). Overlong actors fail closed with LifecycleRuntimeError before the request or job row is written.

## Acceptance
- `tests/test_requested_by_max.py::test_requested_by_max_is_100` passes.
- `tests/test_requested_by_max.py::test_requested_by_accepts_bounded_text` passes.
- `tests/test_requested_by_max.py::test_requested_by_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false. Retention durations stay Andy-gated; this only bounds the requester identifier length.

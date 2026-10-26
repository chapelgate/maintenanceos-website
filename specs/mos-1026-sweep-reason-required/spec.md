# mos-1026-sweep-reason-required: retention sweep reason stays non-empty

## Goal
queue_retention_sweep strips reason and refuses a blank value with LifecycleRuntimeError before the DataLifecycleRequest row is written. Every queued sweep carries an auditable reason.

## Acceptance
- `tests/test_sweep_reason_required.py::test_queue_requires_non_empty_reason` passes.
- `tests/test_sweep_reason_required.py::test_queue_accepts_stripped_reason` passes.
- `tests/test_sweep_reason_required.py::test_queue_rejects_whitespace_reason` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

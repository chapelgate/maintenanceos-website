# mos-1026-execute-request-pending: execute refuses non-PENDING lifecycle requests

## Goal
execute_lifecycle_sweep refuses a DataLifecycleRequest whose status is not PENDING. Completed or unknown-status requests cannot be swept again through this path.

## Acceptance
- `tests/test_execute_request_pending.py::test_execute_requires_pending_status` passes.
- `tests/test_execute_request_pending.py::test_execute_rejects_completed_request` passes.
- `tests/test_execute_request_pending.py::test_execute_accepts_pending_request` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

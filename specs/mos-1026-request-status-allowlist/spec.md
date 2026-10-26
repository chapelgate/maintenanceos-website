# mos-1026-request-status-allowlist: DataLifecycleRequest status stays on PENDING/COMPLETED

## Goal
queue_retention_sweep writes only PENDING. execute_lifecycle_sweep refuses non-PENDING rows and only completes to COMPLETED. Status values outside VALID_REQUEST_STATUSES fail closed.

## Acceptance
- `tests/test_request_status_allowlist.py::test_valid_request_statuses_known_set` passes.
- `tests/test_request_status_allowlist.py::test_queue_retention_sweep_writes_pending` passes.
- `tests/test_request_status_allowlist.py::test_execute_rejects_non_pending_status` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

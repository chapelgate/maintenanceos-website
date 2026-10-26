# mos-1026-request-type-allowlist: DataLifecycleRequest types stay on RETENTION_SWEEP

## Goal
queue_retention_sweep and execute_lifecycle_sweep only accept request_type values in VALID_REQUEST_TYPES={RETENTION_SWEEP}. Unknown types fail closed before write or apply.

## Acceptance
- `tests/test_request_type_allowlist.py::test_valid_request_types_known_set` passes.
- `tests/test_request_type_allowlist.py::test_queue_retention_sweep_writes_allowed_type` passes.
- `tests/test_request_type_allowlist.py::test_execute_rejects_unknown_request_type` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

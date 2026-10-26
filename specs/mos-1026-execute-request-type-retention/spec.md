# mos-1026-execute-request-type-retention: execute refuses non-RETENTION_SWEEP requests

## Goal
`execute_lifecycle_sweep` refuses any request whose `request_type` is not `RETENTION_SWEEP` before applying any lifecycle decisions.

## Acceptance
- `tests/test_execute_request_type_retention.py::test_execute_requires_retention_type` passes.
- `tests/test_execute_request_type_retention.py::test_execute_rejects_wrong_type` passes.
- `tests/test_execute_request_type_retention.py::test_execute_accepts_retention_type` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1025-failure-code-max: delivery failure_code stays bounded

## Goal
record_delivery_status failure_code values are stripped and at most FAILURE_CODE_MAX (100) characters, matching CommunicationDelivery.failure_code String(100). Overlong codes fail closed by returning False before status is updated.

## Acceptance
- `tests/test_failure_code_max.py::test_failure_code_max_is_100` passes.
- `tests/test_failure_code_max.py::test_failure_code_accepts_bounded_text` passes.
- `tests/test_failure_code_max.py::test_failure_code_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

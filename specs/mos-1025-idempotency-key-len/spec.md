# mos-1025-idempotency-key-len: Idempotency-Key length stays bounded

## Goal
Lock HTTP Idempotency-Key on work-order create and appointment confirm to strip and at most 200 characters. Lock Resend provider keys to 1-256 characters after strip. Overlong keys fail closed.

## Acceptance
- `tests/test_idempotency_key_len.py::test_api_idempotency_key_max_is_200` passes.
- `tests/test_idempotency_key_len.py::test_api_idempotency_key_strips_and_rejects_overlong` passes.
- `tests/test_idempotency_key_len.py::test_resend_idempotency_key_bounds` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

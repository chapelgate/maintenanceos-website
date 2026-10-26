# mos-1025-reject-reason-len: Approval reject reason stays bounded

## Goal
Approval reject reasons are stripped, at least 5 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the approval is rejected.

## Acceptance
- `tests/test_reject_reason_len.py::test_reject_reason_max_is_1000` passes.
- `tests/test_reject_reason_len.py::test_reject_reason_accepts_bounded_reason` passes.
- `tests/test_reject_reason_len.py::test_reject_reason_rejects_short_and_overlong` passes.

## Safety boundary
- No voice, deploy, or live personal data. commercial_release_ready stays false.

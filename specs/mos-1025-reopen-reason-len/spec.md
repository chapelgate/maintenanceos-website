# mos-1025-reopen-reason-len: reopen reason stays bounded

## Goal
Reopen reasons are stripped, at least 5 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the work order is marked REOPENED.

## Acceptance
- `tests/test_reopen_reason_len.py::test_reopen_reason_max_is_1000` passes.
- `tests/test_reopen_reason_len.py::test_reopen_reason_accepts_bounded_reason` passes.
- `tests/test_reopen_reason_len.py::test_reopen_reason_rejects_short_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

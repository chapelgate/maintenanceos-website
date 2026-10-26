# mos-1025-no-show-reason-len: no-show reason stays bounded

## Goal
No-show reasons are stripped, at least 5 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the work order is marked NO_SHOW.

## Acceptance
- `tests/test_no_show_reason_len.py::test_no_show_reason_max_is_1000` passes.
- `tests/test_no_show_reason_len.py::test_no_show_reason_accepts_bounded_reason` passes.
- `tests/test_no_show_reason_len.py::test_no_show_reason_rejects_short_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

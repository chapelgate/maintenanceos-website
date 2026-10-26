# mos-1025-resident-comment-len: resident confirmation comment stays bounded

## Goal
Resident confirmation comments are stripped and at most 4000 characters. Non-text and overlong comments fail closed with HTTP 400 before storage.

## Acceptance
- `tests/test_resident_comment_len.py::test_resident_comment_max_is_4000` passes.
- `tests/test_resident_comment_len.py::test_resident_comment_accepts_bounded_text` passes.
- `tests/test_resident_comment_len.py::test_resident_comment_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

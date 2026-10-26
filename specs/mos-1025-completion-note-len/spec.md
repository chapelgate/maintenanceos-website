# mos-1025-completion-note-len: completion note stays bounded text

## Goal
Contractor completion notes are required, stripped, and at most 4000 characters. Empty, non-text, and overlong notes fail closed with HTTP 400 before they are stored or written into the audit detail.

## Acceptance
- `tests/test_completion_note_len.py::test_completion_note_max_is_4000` passes.
- `tests/test_completion_note_len.py::test_completion_note_strips_and_accepts_bounded_text` passes.
- `tests/test_completion_note_len.py::test_completion_note_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

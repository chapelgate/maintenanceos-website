# mos-1028-completion-note-control

## Goal
Contractor completion notes reject control characters via _reject_control_chars in normalize_completion_note.

## Acceptance
- normalize_completion_note runs through _reject_control_chars
- control characters raise HTTP 400
- tests/test_completion_note_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

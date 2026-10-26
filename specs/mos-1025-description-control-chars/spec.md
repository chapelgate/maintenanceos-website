# mos-1025-description-control-chars: work-order descriptions reject C0 controls

## Goal
`/work-orders` descriptions fail closed with HTTP 400 when they contain C0 control characters other than tab, newline, or carriage return. Bounded plain text still passes.

## Acceptance
- `tests/test_description_control_chars.py::test_reject_control_chars_helper_exists` passes.
- `tests/test_description_control_chars.py::test_description_accepts_plain_text` passes.
- `tests/test_description_control_chars.py::test_description_rejects_control_chars` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

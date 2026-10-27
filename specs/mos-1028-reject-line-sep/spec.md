# mos-1028-reject-line-sep

## Goal
Reject line separator (U+2028) and paragraph separator (U+2029) in _reject_control_chars.

## Acceptance
- U+2028 / U+2029 raise HTTP 400
- tests/test_reject_line_sep.py and prior reject tests pass
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

# mos-1028-reject-invisible-format

## Goal
Reject invisible/special format characters (U+2061–U+2064, U+061C, U+180E, U+FFF9, U+FFFC, U+FFFD) in _reject_control_chars.

## Acceptance
- those characters raise HTTP 400
- tests/test_reject_invisible_format.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

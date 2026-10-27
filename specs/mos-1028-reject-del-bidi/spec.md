# mos-1028-reject-del-bidi

## Goal
Reject DEL (U+007F) and Unicode bidirectional override controls in _reject_control_chars so spoofed field values fail closed.

## Acceptance
- _reject_control_chars raises 400 on DEL and bidi overrides
- tab/newline/carriage-return still allowed
- tests/test_reject_del_bidi.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

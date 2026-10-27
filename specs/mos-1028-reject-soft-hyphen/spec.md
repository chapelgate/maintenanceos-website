# mos-1028-reject-soft-hyphen

## Goal
Reject soft hyphen (U+00AD) in _reject_control_chars.

## Acceptance
- soft hyphen raises HTTP 400
- tests/test_reject_soft_hyphen.py and prior reject tests pass
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

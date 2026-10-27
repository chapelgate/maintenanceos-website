# mos-1028-reject-nel

## Goal
Reject Unicode C1 controls (U+0080–U+009F), including NEL, in _reject_control_chars.

## Acceptance
- C1 controls raise HTTP 400
- tests/test_reject_nel.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

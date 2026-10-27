# mos-1028-safety-reason-control

## Goal
Safety clearance reasons reject control characters via _reject_control_chars.

## Acceptance
- /safety/clear reason runs through _reject_control_chars
- control characters raise HTTP 400
- tests/test_safety_reason_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

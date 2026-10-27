# mos-1028-resident-comment-control

## Goal
Resident confirmation comments reject control characters via _reject_control_chars.

## Acceptance
- /resident-confirmation comment runs through _reject_control_chars
- control characters raise HTTP 400
- tests/test_resident_comment_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

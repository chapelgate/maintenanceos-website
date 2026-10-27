# mos-1028-ai-reason-control

## Goal
AI side-effect control reasons reject control characters via _reject_control_chars.

## Acceptance
- /controls/ai-side-effects reason runs through _reject_control_chars
- control characters raise HTTP 400
- tests/test_ai_reason_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

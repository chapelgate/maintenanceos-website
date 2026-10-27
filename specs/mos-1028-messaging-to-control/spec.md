# mos-1028-messaging-to-control

## Goal
Fail closed when messaging inbound To/Called contains control characters or exceeds MESSAGING_TO_MAX, before dedicated-number matching.

## Acceptance
- messaging_inbound sanitizes To via _reject_control_chars + _bounded_text(MESSAGING_TO_MAX)
- voice endpoints unchanged
- tests/test_messaging_to_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

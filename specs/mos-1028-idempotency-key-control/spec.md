# mos-1028-idempotency-key-control

## Goal
Idempotency-Key rejects control characters on work-order create and appointment confirm.

## Acceptance
- both call sites use _reject_control_chars
- tests pass

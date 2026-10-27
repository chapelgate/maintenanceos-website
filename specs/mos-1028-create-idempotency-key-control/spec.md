# mos-1028-create-idempotency-key-control

## Goal
Work-order create Idempotency-Key rejects control characters.

## Acceptance
- create_work_order event_key uses _reject_control_chars
- tests pass

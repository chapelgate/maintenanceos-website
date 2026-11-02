# mos-1276-idempotency-scope-control-chars
FEATURE: reject control characters in claim_action scope

## What
action_key already rejected C0; scope did not. Reject scope C0 with ValueError scope_control_chars.

## Acceptance
- claim_action raises on scope with C0
- clean scope still claims

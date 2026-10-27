# mos-1028-claim-action-control
## Goal
claim_action rejects control characters in action_key before any receipt query.
## Acceptance
- raises ValueError("action_key_control_chars")
- session.query is not called for control-char keys
- tests pass

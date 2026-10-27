# mos-1028-action-key-control
## Goal
Reject control characters in contractor action_key and resident event_key before any session opens.
## Acceptance
- accept/decline/availability/completion/confirm fail closed on control chars
- SessionLocal is not opened for control-char keys
- tests pass

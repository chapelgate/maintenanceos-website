# mos-1028-message-sid-control
## Goal
Reject control characters in messaging MessageSid before it becomes an event key.
## Acceptance
- messaging_event_key rejects MessageSid containing C0 controls
- valid SIDs still return unchanged
- tests pass; commercial_release_ready stays false

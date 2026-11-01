# mos-1217-escalation-reason-control-chars
FEATURE: reject control characters in bounded_escalation_reason

## What
bounded_escalation_reason enforces length but allows control characters.

## Acceptance
- Raise ValueError on control characters (except tab/newline/cr)
- Existing length/empty rejects stay
- Named acceptance test green

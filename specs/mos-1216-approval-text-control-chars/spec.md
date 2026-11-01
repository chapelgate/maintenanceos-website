# mos-1216-approval-text-control-chars
FEATURE: reject control characters in approval proposed_action and reason

## What
bounded_proposed_action / bounded_approval_reason enforce length but allow control characters.

## Acceptance
- Both helpers raise ValueError on control characters (except tab/newline/cr)
- Existing length/empty rejects stay
- Named acceptance test green

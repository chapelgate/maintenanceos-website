# mos-1226-action-result-control-chars
FEATURE: reject control characters in record_action_result fields

## What
record_action_result validates length/action-type but allows control characters in action_key, actor, provider_reference, detail.

## Acceptance
- Raise ValueError on control chars (except tab/newline/cr in detail)
- Existing length/action-type rejects stay
- Named acceptance test green

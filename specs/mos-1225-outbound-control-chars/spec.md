# mos-1225-outbound-control-chars
FEATURE: reject control characters in queue_outbound recipient/action_key/body

## What
queue_outbound validates length/channel but allows control characters in recipient, action_key, and body.

## Acceptance
- Raise ValueError on control chars (except tab/newline/cr in body; none in recipient/action_key)
- Existing length/channel rejects stay
- Named acceptance test green

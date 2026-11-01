# mos-1222-ai-side-effect-control-chars
FEATURE: reject control characters in set_ai_side_effects actor/reason

## What
set_ai_side_effects validates actor/reason length but allows control characters.

## Acceptance
- Raise ValueError on control chars in actor or reason (except tab/newline/cr)
- Existing length/empty rejects stay
- Named acceptance test green

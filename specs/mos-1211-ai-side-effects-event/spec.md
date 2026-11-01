# mos-1211-ai-side-effects-event
FEATURE: emit operational_event when AI side-effects kill switch changes

## What
set_ai_side_effects updates RuntimeControl but emits no operational event for operators.

## Acceptance
- Emit operational_event("ai_side_effects_changed", ...) after a successful change
- Fields: outcome/reason_code only (never actor or reason text)
- Existing idempotency / AI side-effect suites stay green

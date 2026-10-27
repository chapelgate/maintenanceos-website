# mos-1027-ai-side-effect-actor-max

## Goal
Fail closed when set_ai_side_effects receives a blank or overlong actor (max 100, matching RuntimeControl.updated_by / AuditEvent.actor).

## Acceptance
tests/test_ai_side_effect_actor_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

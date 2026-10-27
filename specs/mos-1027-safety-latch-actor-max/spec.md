# mos-1027-safety-latch-actor-max

## Goal
Fail closed when latch_critical_safety receives a blank or overlong actor (max 100, matching CriticalSafetyState.established_by / AuditEvent.actor).

## Acceptance
tests/test_safety_latch_actor_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

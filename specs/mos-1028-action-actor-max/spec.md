# mos-1028-action-actor-max

## Goal
Fail closed when record_action_result receives a blank or overlong actor (max 100, matching AuditEvent.actor).

## Acceptance
- ACTION_ACTOR_MAX == 100
- blank and overlong actors raise ValueError before session work
- bounded actors still record
- tests/test_action_actor_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

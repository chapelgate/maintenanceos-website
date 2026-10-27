# mos-1028-action-type-max

## Goal
Fail closed when record_action_result receives an action_type longer than ACTION_TYPE_MAX before allowlist membership is considered.

## Acceptance
- ACTION_TYPE_MAX == 64 and covers all CONFIRMABLE_ACTIONS
- overlong action_type raises ValueError before session work
- allowlisted types still record
- tests/test_action_type_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

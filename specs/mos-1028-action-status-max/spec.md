# mos-1028-action-status-max

## Goal
Fail closed when record_action_result receives a status longer than ACTION_STATUS_MAX before ACTION_STATES membership is considered.

## Acceptance
- ACTION_STATUS_MAX == 16 and covers all ACTION_STATES
- overlong status raises ValueError before session work
- allowlisted statuses still record
- tests/test_action_status_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

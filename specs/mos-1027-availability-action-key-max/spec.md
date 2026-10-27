# mos-1027-availability-action-key-max

## Goal
Fail closed when submit_availability receives a blank or overlong action_key (max ACTION_KEY_MAX=200, matching ActionReceipt.action_key), returning None before opening a session.

## Acceptance
tests/test_availability_action_key_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

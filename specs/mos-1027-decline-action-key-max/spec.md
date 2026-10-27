# mos-1027-decline-action-key-max

## Goal
Fail closed when decline_contractor receives a blank or overlong action_key (max ACTION_KEY_MAX=200, matching ActionReceipt.action_key), returning False before opening a session.

## Acceptance
tests/test_decline_action_key_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

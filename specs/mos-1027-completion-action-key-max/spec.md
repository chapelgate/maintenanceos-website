# mos-1027-completion-action-key-max

## Goal
Fail closed when submit_completion receives a blank or overlong action_key (max ACTION_KEY_MAX=200, matching ActionReceipt.action_key), returning None before opening a session.

## Acceptance
tests/test_completion_action_key_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

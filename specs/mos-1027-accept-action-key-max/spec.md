# mos-1027-accept-action-key-max

## Goal
Fail closed when accept_contractor receives a blank or overlong action_key (max ACTION_KEY_MAX=200, matching ActionReceipt.action_key and ContractorAcceptance.action_key), returning False before opening a session.

## Acceptance
tests/test_accept_action_key_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

# mos-1025-delivery-action-key-max: delivery action_key stays bounded

## Goal
queue_outbound action_key values are stripped and at most ACTION_KEY_MAX (200) characters, matching CommunicationDelivery.action_key String(200). Overlong action keys fail closed with ValueError("Invalid outbound communication") before Communication rows are written.

## Acceptance
- `tests/test_delivery_action_key_max.py::test_delivery_action_key_max_is_200` passes.
- `tests/test_delivery_action_key_max.py::test_delivery_action_key_accepts_bounded_text` passes.
- `tests/test_delivery_action_key_max.py::test_delivery_action_key_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1025-receipt-action-key-max: ActionReceipt action_key stays bounded

## Goal
claim_action action_key values are at most ACTION_KEY_MAX (200) characters, matching ActionReceipt.action_key String(200). Overlong keys fail closed with ValueError before ActionReceipt rows are written.

## Acceptance
- `tests/test_receipt_action_key_max.py::test_receipt_action_key_max_is_200` passes.
- `tests/test_receipt_action_key_max.py::test_receipt_action_key_accepts_bounded_text` passes.
- `tests/test_receipt_action_key_max.py::test_receipt_action_key_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

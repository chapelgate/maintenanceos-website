# mos-1025-receipt-scope-max: ActionReceipt scope stays bounded

## Goal
claim_action scope values are at most SCOPE_MAX (80) characters, matching ActionReceipt.scope String(80). Overlong scopes fail closed with ValueError before ActionReceipt rows are written.

## Acceptance
- `tests/test_receipt_scope_max.py::test_receipt_scope_max_is_80` passes.
- `tests/test_receipt_scope_max.py::test_receipt_scope_accepts_bounded_text` passes.
- `tests/test_receipt_scope_max.py::test_receipt_scope_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

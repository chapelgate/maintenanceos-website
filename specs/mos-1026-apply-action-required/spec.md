# mos-1026-apply-action-required: apply refuses blank lifecycle decision actions

## Goal
`_apply_decision` refuses any decision whose `action` is missing or blank before claim_action or mutation.

## Acceptance
- `tests/test_apply_action_required.py::test_apply_requires_action` passes.
- `tests/test_apply_action_required.py::test_apply_rejects_blank_action` passes.
- `tests/test_apply_action_required.py::test_apply_retains_with_action` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

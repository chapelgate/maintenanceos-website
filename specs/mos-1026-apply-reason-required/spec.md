# mos-1026-apply-reason-required: apply refuses blank lifecycle decision reasons

## Goal
`_apply_decision` refuses any non-retain decision whose reason is missing or blank before claim_action or mutation. Erase and preserve_minimal actions must carry an auditable reason.

## Acceptance
- `tests/test_apply_reason_required.py::test_apply_requires_reason` passes.
- `tests/test_apply_reason_required.py::test_apply_rejects_blank_reason` passes.
- `tests/test_apply_reason_required.py::test_apply_retains_without_reason_check` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

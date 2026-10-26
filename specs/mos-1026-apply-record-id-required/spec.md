# mos-1026-apply-record-id-required: apply refuses blank lifecycle record ids

## Goal
`_apply_decision` refuses any non-retain decision whose `record_id` is missing or blank before claim_action or mutation.

## Acceptance
- `tests/test_apply_record_id_required.py::test_apply_requires_record_id` passes.
- `tests/test_apply_record_id_required.py::test_apply_rejects_blank_record_id` passes.
- `tests/test_apply_record_id_required.py::test_apply_retains_without_record_id_check` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

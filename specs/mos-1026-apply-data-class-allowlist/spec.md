# mos-1026-apply-data-class-allowlist: apply refuses unsupported lifecycle data classes

## Goal
`_apply_decision` refuses any non-retain decision whose `data_class` is outside `SUPPORTED_RUNTIME_CLASSES` before claim_action or mutation.

## Acceptance
- `tests/test_apply_data_class_allowlist.py::test_apply_checks_supported_runtime_classes` passes.
- `tests/test_apply_data_class_allowlist.py::test_apply_rejects_unknown_data_class` passes.
- `tests/test_apply_data_class_allowlist.py::test_apply_retains_without_class_check` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

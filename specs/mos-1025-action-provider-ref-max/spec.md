# mos-1025-action-provider-ref-max: action provider_reference stays bounded

## Goal
record_action_result provider_reference values are stripped and at most PROVIDER_REFERENCE_MAX (200) characters, matching ActionExecution.provider_reference String(200). Overlong references fail closed with ValueError before ActionExecution rows are written.

## Acceptance
- `tests/test_action_provider_ref_max.py::test_action_provider_reference_max_is_200` passes.
- `tests/test_action_provider_ref_max.py::test_action_provider_reference_accepts_bounded_text` passes.
- `tests/test_action_provider_ref_max.py::test_action_provider_reference_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1026-result-ref-max: action receipt result_ref stays at most 200 characters

## Goal
ActionReceipt.result_ref values are assigned through set_result_ref and stay at most RESULT_REF_MAX (200) characters, matching ActionReceipt.result_ref String(200). Overlong values fail closed with ValueError before the receipt field is written.

## Acceptance
- `tests/test_result_ref_max.py::test_result_ref_max_is_200` passes.
- `tests/test_result_ref_max.py::test_result_ref_accepts_bounded_text` passes.
- `tests/test_result_ref_max.py::test_result_ref_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1026-action-detail-max: ActionExecution detail stays bounded

## Goal
record_action_result detail values are at most DETAIL_MAX (4000) characters. Overlong details fail closed with ValueError before ActionExecution rows are written.

## Acceptance
- `tests/test_action_detail_max.py::test_action_detail_max_is_4000` passes.
- `tests/test_action_detail_max.py::test_action_detail_accepts_bounded_text` passes.
- `tests/test_action_detail_max.py::test_action_detail_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

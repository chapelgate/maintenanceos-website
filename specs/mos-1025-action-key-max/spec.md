# mos-1025-action-key-max: ActionExecution action_key stays bounded

## Goal
record_action_result action_key values are stripped and at most ACTION_KEY_MAX (200) characters, matching ActionExecution.action_key String(200). Overlong keys fail closed with ValueError before ActionExecution rows are written.

## Acceptance
- `tests/test_action_key_max.py::test_action_key_max_is_200` passes.
- `tests/test_action_key_max.py::test_action_key_accepts_bounded_text` passes.
- `tests/test_action_key_max.py::test_action_key_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

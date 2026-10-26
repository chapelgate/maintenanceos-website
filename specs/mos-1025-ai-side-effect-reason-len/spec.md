# mos-1025-ai-side-effect-reason-len: AI side-effect control reason stays bounded

## Goal
AI side-effect control reasons are required, stripped, and at most 500 characters. Empty, non-text, and overlong reasons fail closed with HTTP 400 before the control changes.

## Acceptance
- `tests/test_ai_side_effect_reason_len.py::test_ai_side_effect_reason_max_is_500` passes.
- `tests/test_ai_side_effect_reason_len.py::test_ai_side_effect_reason_accepts_bounded_text` passes.
- `tests/test_ai_side_effect_reason_len.py::test_ai_side_effect_reason_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

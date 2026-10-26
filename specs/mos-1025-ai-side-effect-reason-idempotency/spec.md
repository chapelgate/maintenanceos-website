# mos-1025-ai-side-effect-reason-idempotency: set_ai_side_effects reason stays bounded

## Goal
AI side-effect control reasons stored via set_ai_side_effects are stripped and at most 500 characters. Overlong reasons fail closed with ValueError before RuntimeControl is written. This covers the dashboard path that does not go through the HTTP bound.

## Acceptance
- `tests/test_ai_side_effect_reason_idempotency.py::test_ai_side_effect_reason_max_is_500` passes.
- `tests/test_ai_side_effect_reason_idempotency.py::test_ai_side_effect_reason_accepts_bounded_text` passes.
- `tests/test_ai_side_effect_reason_idempotency.py::test_ai_side_effect_reason_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

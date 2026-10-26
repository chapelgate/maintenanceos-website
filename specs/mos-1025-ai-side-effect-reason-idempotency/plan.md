# Plan
1. Add AI_SIDE_EFFECT_REASON_MAX = 500 to idempotency.py.
2. Reject overlong reasons in set_ai_side_effects before RuntimeControl write.
3. Run the three named tests.

# Plan
1. Add AI_SIDE_EFFECT_ACTOR_MAX = 100 in idempotency.py (matching RuntimeControl.updated_by).
2. Strip and validate actor before writing RuntimeControl.
3. Add tests.

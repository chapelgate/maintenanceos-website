1. Extend idempotency._has_control_chars to treat DEL and C1 as controls.
2. Route set_result_ref and set_ai_side_effects checks through _has_control_chars.
3. Named acceptance tests for DEL/C1 reject on claim, result_ref, actor, reason.

# mos-1279-idempotency-del-c1

## Goal
idempotency control checks must reject DEL (U+007F) and C1 controls (U+0080–U+009F) for claim_action scope/action_key, set_result_ref, and set_ai_side_effects actor/reason, matching api._reject_control_chars.

## Acceptance
- claim_action rejects DEL/C1 in scope and action_key
- set_result_ref rejects DEL/C1
- set_ai_side_effects rejects DEL/C1 in actor and reason
- clean paths still succeed; existing C0 suites remain green

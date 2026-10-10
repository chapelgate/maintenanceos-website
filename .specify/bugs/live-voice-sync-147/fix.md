# Fix

- Cherry-picked `51da30f` onto `main`: the response watchdog (`_response_watchdog_due`, a 7 s re-prompt after a finished caller turn with no model audio) and the 600 ms `GEMINI_SILENCE_DURATION_MS` default, with its tests.
  - Conflicts were resolved by keeping `main`'s correction watchdog **and** adding the response watchdog.
  - `main`'s `_emergency_transfer_requested` routing is kept. The frozen baseline's older `_explicit_human_request or _needs_payment_handoff` condition was **not** brought back.
- Prompt: `main`'s intake section (from "For repair or maintenance enquiries…" up to "If the caller knows the gate number…") was replaced with the live text, which adds the one-field, no-guess, phone-accuracy and fault-accuracy rules.
  - `main`'s stricter rules are kept: phone privacy, the correction rule, full read-back with "Is all of that correct?", key/no-transfer and the gas/CO safety rule.
- New `tests/test_gemini_live_call_rules.py`.

Rollback: revert the merge commit. Nothing is deployed by this change.

# Fix

- 3-way merge (`git merge-file`, base `369d09d`, main `b3c165e`, live `6ef7227`) of `voice_bridge.py`. Three conflicts resolved:
  1. `from_openai` nonlocals: union of main's key-context state and live's provider/audio state; iterate the reconnectable `provider["ws"]`.
  2. Resident-key guard keeps main's `resident_key_first_answer_pending` condition plus live's audio `clear`.
  3. `resident_key_contract_failed`: live's `soft_recover` (routine key enquiries never transfer, per prompt) with the instruction extended to main's gate-number contract; `resident_key_first_answer_pending = False` kept after a pass.
- Safety fix found in review: main-only RED reason `animal_welfare_emergency` added to `HANDOFF_STREAM_END_REASONS` (live's default would have soft-recovered it).
- Tests: live's `tests/test_issue67_voice_regressions.py`, 3-way-merged `tests/test_voice_bridge.py`, new `tests/test_live_sync_stream_end_reasons.py`.
- No env, deploy or config change. New optional env knobs `VOICE_PROVIDER_MAX_RECONNECTS` / `VOICE_PROVIDER_RECONNECT_BUDGET_SECONDS` have the live defaults (2 / 8 s).

Rollback: revert the merge commit.

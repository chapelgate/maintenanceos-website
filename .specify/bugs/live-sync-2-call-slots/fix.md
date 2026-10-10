# Fix

- `api.py`: `_schedule_pending_voice_lease_cleanup` (daemon `threading.Timer`, default 30 s, clamped 10–120 s from `VOICE_PENDING_LEASE_TIMEOUT_SECONDS`): if the lease is still held and the session was never claimed by a stream handler (`voice_bridge.is_active_call_session`; both OpenAI and Gemini handlers claim on connect), release capacity only and record `voice_stream_not_started`. `provider_ready()` false now releases capacity only.
- `call_capacity.py`: `has_call`, `has_call_capacity_lease`, `release_call_capacity_only`.
- `tests/test_staged_voice_routes.py`: live tests for unclaimed-lease release and never releasing a claimed session (3-way merged).
- Main had not changed these files since base, so they now equal live exactly. Stacked on reconciliation 1 (needs `is_active_call_session`).

Rollback: revert the merge commit.

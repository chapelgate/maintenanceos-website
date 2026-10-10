# Assessment: gas and carbon monoxide caller-safety advice missing

Route: BUG. Existing behaviour is demonstrably broken: a caller who reports a gas smell or a carbon monoxide alarm is never told what to do.

Reproduced on `origin/main` @ `9bc9c62` (10 Oct 2026, CG, Python 3.13):
- `gemini_voice.py` and `voice_bridge.py` `SYSTEM_PROMPT`: no occurrence of "gas", "carbon monoxide" or "0800 111 999".
- `decision_engine.classify("I can smell gas in the kitchen")` returns safety flag `GAS_SMELL` (RED, latched), so the back office is protected.
- OpenAI Realtime path (`voice_bridge.py` caller-turn branch): on a `deterministic_safety` escalation it calls `request_transfer(..., live_handoff=False)`, which closes the media stream. No call update speaks anything first, so the caller is likely cut off before any advice. A prompt change alone would not be heard on this path.

Scope (Goal Lock): implement product spec `product-change-gas-co.md` (approved in principle by Andy, 10 Oct 2026), sections 3 and 4a–4d, plus its 19 tests. `decision_engine.py`, deploy, CI, env and server config are out of scope.

Reuse: existing `inbound_fallback_twiml`, the Twilio `calls(sid).update(twiml=…)` pattern from `_request_live_human_transfer`, `record_call_interruption`, and `voice_policy` action-claim checks. No new service, dependency or env var.

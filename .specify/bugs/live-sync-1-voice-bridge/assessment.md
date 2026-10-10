# Assessment: live voice_bridge.py fixes missing from main (reconciliation 1 of 4, issue #147)

Route: BUG. The live host runs `voice_bridge.py` at blob `77e4ff9` = commit `6ef7227` ("reconnect provider and stream safe audio without dead air", branches `cursor/alleygates-voice-rebuild-d235` / `cursor/issue-67-alleygates-voice-31921-e283`), which was never merged. Main (`b3c165e`) lacks it, so deploying main would remove live fixes for Twilio 31921 dead-air (stream kept open on recoverable OpenAI defects, bounded provider reconnect, soft recovery, gated audio, latency telemetry, `is_active_call_session`).

Common base `369d09d`. Live side: `9972c8f`, `1223830`, `6ef7227`. Main side since base: 9 commits incl. gas/CO advice (#150), animal emergency, key-order contract, explicit handoff.

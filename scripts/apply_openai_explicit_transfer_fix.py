from pathlib import Path

p = Path('voice_bridge.py')
s = p.read_text()

s = s.replace(
    '        stream_sid = str(start.get("streamSid") or "")\n        openai_ws = await _connect_openai',
    '        stream_sid = str(start.get("streamSid") or "")\n        call_sid = str(start.get("callSid") or "")\n        openai_ws = await _connect_openai',
    1,
)

old = '''        async def request_transfer(reason: str, already_recorded: bool = False) -> None:\n            if transfer_required.is_set():\n                return\n            transfer_required.set()\n            await _safe_close(websocket, 1000)\n            if not already_recorded:\n                with suppress(Exception):record_call_interruption(call_session_id, reason)\n            with suppress(Exception):close_call_session(call_session_id)\n'''
new = '''        async def request_transfer(reason: str, already_recorded: bool = False) -> None:\n            if transfer_required.is_set():\n                return\n            transfer_required.set()\n            if reason == "caller_requested_human":\n                transferred = False\n                with suppress(Exception):\n                    transferred = await asyncio.to_thread(_request_live_human_transfer, call_sid)\n                if not transferred:\n                    reason = "human_transfer_failed"\n            await _safe_close(websocket, 1000)\n            if not already_recorded:\n                with suppress(Exception): record_call_interruption(call_session_id, reason)\n            with suppress(Exception): close_call_session(call_session_id)\n'''
if old not in s:
    raise SystemExit('request_transfer block not found')
s = s.replace(old, new, 1)

# Partial transcript hypotheses may be unstable and must not trigger live transfer.
s = s.replace('''                    transcript_parts[item_id] = transcript\n                    if record_safety_observation(call_session_id, transcript_parts[item_id]):\n                        await request_transfer("deterministic_safety", already_recorded=True)\n                        return\n''','''                    transcript_parts[item_id] = transcript\n''',1)

# Completed transcripts are persisted. Only a clear human request changes the live call.
old_completed = '''                    if record_transcript_segment(call_session_id, "Caller", transcript):\n                        await request_transfer("deterministic_escalation", already_recorded=True)\n                        return\n                    turn_cleared = True\n'''
new_completed = '''                    record_transcript_segment(call_session_id, "Caller", transcript)\n                    lowered_transcript = transcript.casefold()\n                    explicit_human = any(phrase in lowered_transcript for phrase in (\n                        "speak to a person", "speak to someone", "speak to a human",\n                        "speak to the manager", "talk to a person", "talk to someone",\n                        "put me through", "transfer me", "get me a person",\n                    ))\n                    if explicit_human:\n                        await request_transfer("caller_requested_human")\n                        return\n                    turn_cleared = True\n'''
if old_completed not in s:
    raise SystemExit('completed transcript block not found')
s = s.replace(old_completed, new_completed, 1)

# A transcription failure is logged/closed, never silently transferred.
s = s.replace('''                elif event_type == "conversation.item.input_audio_transcription.failed":\n                    await request_transfer("openai_transcription_failed")\n                    return\n''','''                elif event_type == "conversation.item.input_audio_transcription.failed":\n                    operational_event("voice_transcription_failed", transport="openai", outcome="failed")\n                    await request_transfer("openai_transcription_failed")\n                    return\n''',1)

p.write_text(s)
print('OPENAI_EXPLICIT_TRANSFER_PARITY_APPLIED')

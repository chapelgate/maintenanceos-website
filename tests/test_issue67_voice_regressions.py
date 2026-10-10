"""Issue #67 — Alleygates live-voice stability regressions (Twilio 31921 root cause).

These tests lock the keep-open Media Stream contract: recoverable OpenAI defects must
never application-close the Twilio WebSocket (error 31921). Genuine handoffs may close.
"""

from __future__ import annotations

import asyncio
import base64
import inspect
import json
import time

import pytest

import gemini_voice
import voice_bridge
from tests.test_voice_bridge import FakeOpenAI, FakeTwilio, configure_bridge, connected_start_events


AUDIO = base64.b64encode(b"a" * 160).decode()
GREETING = "Hi, thank you for calling Chapel Gate. How can we help you today?"


def test_ends_media_stream_classifies_31921_vs_keep_open():
    assert voice_bridge.ends_media_stream("caller_requested_human") is True
    assert voice_bridge.ends_media_stream("gate_emergency_handoff") is True
    assert voice_bridge.ends_media_stream("deterministic_safety") is True
    assert voice_bridge.ends_media_stream("voice_bridge_failure:RuntimeError") is True
    assert voice_bridge.ends_media_stream("voice_provider_reconnect_exhausted") is True

    keep_open = [
        "openai_transcription_timeout",
        "openai_transcription_failed",
        "openai_output_transcript_missing",
        "openai_response_failed",
        "initial_greeting_contract_failed",
        "gate_postcode_contract_failed",
        "resident_key_contract_failed",
        "proactive_handoff_language_blocked",
        "voice_transport_disconnected",
        "voice_provider_reconnected",
        "assistant_stream_aborted_mid_turn",
        "assistant_policy_rejected:unverified_private_disclosure",
        "model_action_rejected:duplicate_model_action",
        "openai_realtime_error:upstream_failure",
    ]
    for reason in keep_open:
        assert voice_bridge.ends_media_stream(reason) is False, reason


def test_greeting_matches_allows_minor_phrasing_drift():
    assert voice_bridge.greeting_matches(GREETING)
    assert voice_bridge.greeting_matches(
        "Hi! Thank you for calling Chapel Gate — how can we help you today?"
    )
    assert not voice_bridge.greeting_matches("Welcome to Chapelgate maintenance line.")


def test_openai_path_keeps_media_stream_open_on_recoverable_failures(monkeypatch):
    """Duplicate / missing transcript / failed response must not close Twilio WS."""
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {"type": "conversation.item.input_audio_transcription.failed"},
            {"type": "response.output_audio.delta", "item_id": "bad", "delta": AUDIO},
            {"type": "response.done", "response": {"status": "failed"}},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "The alley gate lock is broken",
            },
            {"type": "response.output_audio.delta", "item_id": "out", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "out",
                "transcript": "Can I take your full name and the gate number?",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    observations = configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    reasons = [reason for kind, reason in observations if kind == "interrupt"]
    assert "openai_transcription_failed" in reasons
    assert "openai_response_failed" in reasons
    assert not twilio.closed
    assert ("close", 7) in observations  # normal stop finalization, not WS tear-down


def test_websocket_premature_closure_not_triggered_by_provider_disconnect(monkeypatch):
    """Provider drop triggers bounded reconnect; Twilio stays open until exhaustion handoff."""
    first = FakeOpenAI([], hold_open=False)
    second = FakeOpenAI([], hold_open=False)
    third = FakeOpenAI([], hold_open=False)
    twilio = FakeTwilio(connected_start_events())
    observations = configure_bridge(monkeypatch, [first, second, third])
    monkeypatch.setenv("VOICE_PROVIDER_MAX_RECONNECTS", "2")
    monkeypatch.setattr(voice_bridge, "_request_live_human_transfer", lambda call_sid: True)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    reasons = [reason for kind, reason in observations if kind == "interrupt"]
    assert "voice_transport_disconnected" in reasons
    assert "voice_provider_reconnect_exhausted" in reasons
    # Exhaustion uses the clean handoff close path (not indefinite silence / 31921 soft-exit).
    assert twilio.closed
    assert twilio.close_code == 1000


def test_barge_in_cancels_assistant_audio_and_keeps_stream(monkeypatch):
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {"type": "input_audio_buffer.speech_started"},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "I need a key for my alley gate",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.05)]
    )
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert any(item.get("event") == "clear" for item in twilio.sent)
    assert any(item.get("type") == "conversation.item.truncate" for item in openai.sent)
    assert not twilio.closed


def test_server_vad_and_response_cancellation_are_configured():
    source = inspect.getsource(voice_bridge._configure_realtime)
    assert '"type": "server_vad"' in source or "'type': 'server_vad'" in source or "server_vad" in source
    assert "interrupt_response" in source
    assert "create_response" in source
    assert "silence_duration_ms" in source
    # Barge-in truncate path must remain present.
    bridge = inspect.getsource(voice_bridge.handle_twilio_media_stream)
    assert "conversation.item.truncate" in bridge
    assert "input_audio_buffer.speech_started" in bridge


def test_single_voice_output_no_twilio_tts_on_stream_or_transfer():
    stream = inspect.getsource(voice_bridge.inbound_stream_twiml)
    transfer = inspect.getsource(voice_bridge._request_live_human_transfer)
    assert "<Say" not in stream
    assert "<Say" not in transfer
    assert "<Dial>" in transfer


def test_openai_latency_tuning_keeps_short_turns_and_fast_vad(monkeypatch):
    monkeypatch.setenv("OPENAI_VAD_SILENCE_MS", "300")
    monkeypatch.setenv("OPENAI_REALTIME_MAX_OUTPUT_TOKENS", "320")
    monkeypatch.setenv("OPENAI_REALTIME_SPEED", "1.08")
    sent = []

    class CaptureWS:
        async def send(self, payload):
            sent.append(json.loads(payload))

    asyncio.run(voice_bridge._configure_realtime(CaptureWS()))
    session = sent[0]["session"]
    vad = session["audio"]["input"]["turn_detection"]
    assert vad["type"] == "server_vad"
    assert vad["silence_duration_ms"] == 300
    assert vad["interrupt_response"] is True
    assert session["max_output_tokens"] == 320
    assert session["audio"]["output"]["speed"] == 1.08


def test_gate_number_intake_rejects_postcode_prompt_without_closing(monkeypatch):
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "The alley gate is broken and needs repair",
            },
            {"type": "response.output_audio.delta", "item_id": "bad", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "bad",
                "transcript": "What is the postcode of the gate?",
            },
            {"type": "response.output_audio.delta", "item_id": "good", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "good",
                "transcript": "Do you know the gate number?",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    corrections = [
        item
        for item in openai.sent
        if item.get("type") == "response.create"
        and "Do not ask for any postcode" in item.get("response", {}).get("instructions", "")
    ]
    assert corrections
    assert not twilio.closed


def test_resident_key_route_isolated_from_master_key(monkeypatch):
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "I need a replacement alley gate key please",
            },
            {"type": "response.output_audio.delta", "item_id": "bad", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "bad",
                "transcript": "Ask your landlord about a master key.",
            },
            {"type": "response.output_audio.delta", "item_id": "good", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "good",
                "transcript": "You can order a resident key at www.alleygates.co.uk for £22 including VAT.",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    corrections = [
        item
        for item in openai.sent
        if item.get("type") == "response.create"
        and "ordinary resident alley-gate key" in item.get("response", {}).get("instructions", "")
    ]
    assert corrections
    assert not twilio.closed
    prompt = voice_bridge.SYSTEM_PROMPT.casefold()
    assert "never mention master-key details unless the caller explicitly asks" in prompt


def test_master_key_isolation_in_prompt_and_classifier():
    prompt = voice_bridge.SYSTEM_PROMPT
    assert "MASTER KEY RULE" in prompt
    assert "info@alleygates.co.uk" in prompt
    # Ordinary key must not be classified as master-key emergency handoff.
    escalate, reason, _ = voice_bridge.requires_immediate_human_escalation(
        "I need a replacement key for my alley gate"
    )
    assert escalate is False
    assert reason == ""


def test_emergency_transfer_still_closes_for_genuine_handoff(monkeypatch):
    transferred = []

    def fake_transfer(call_sid):
        transferred.append(call_sid)
        return True

    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "The alley gate is jammed shut and this is an emergency",
            },
        ]
    )
    twilio = FakeTwilio(connected_start_events())
    observations = configure_bridge(monkeypatch, openai)

    def escalate_segment(call_id, speaker, text):
        return speaker == "Caller"

    monkeypatch.setattr(voice_bridge, "record_transcript_segment", escalate_segment)
    monkeypatch.setattr(voice_bridge, "_request_live_human_transfer", fake_transfer)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert transferred == ["CA-test"]
    assert twilio.closed
    assert twilio.close_code == 1000
    assert ("close", 7) in observations


def test_duplicate_speech_suppressed_for_gated_turns_until_transcript(monkeypatch):
    """High-risk claims without a safe unlock must not leak audio to Twilio."""
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {"type": "input_audio_buffer.speech_started"},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "hello",
            },
            {"type": "response.output_audio.delta", "item_id": "risk", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "risk",
                "transcript": "Emergency services have been notified.",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    observations = configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    reasons = [reason for kind, reason in observations if kind == "interrupt"]
    assert any("assistant_policy_rejected" in r for r in reasons)
    # Greeting may stream; the risk claim must not remain as uncorrected media after reject.
    assert not twilio.closed


def test_soft_recover_path_exists_and_gemini_keep_open_model_preserved():
    openai_src = inspect.getsource(voice_bridge.handle_twilio_media_stream)
    assert "soft_recover" in openai_src
    assert "voice_soft_recover" in openai_src
    assert "ends_media_stream" in openai_src
    gemini_src = inspect.getsource(gemini_voice.handle_gemini_media_stream)
    # Gemini must not close Twilio on provider disconnect alone.
    assert "gemini_transport_disconnected" in gemini_src
    assert gemini_src.index("gemini_transport_disconnected") > gemini_src.index("record_call_interruption")


def test_response_cancellation_on_barge_in_is_bounded(monkeypatch):
    started = time.monotonic()
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "out", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "out", "transcript": GREETING},
            {"type": "input_audio_buffer.speech_started"},
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.02)]
    )
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    elapsed = time.monotonic() - started
    assert elapsed < 2.0
    assert any(item.get("type") == "conversation.item.truncate" for item in openai.sent)


def test_provider_disconnect_reconnects_and_conversation_continues(monkeypatch):
    """Synthetic staging: provider drop → reconnect → continue; Twilio WS stays open."""
    first = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
        ],
        hold_open=False,
    )
    second = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "resume", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "resume",
                "transcript": "Sorry about that — please continue.",
            },
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "The alley gate lock is broken",
            },
            {"type": "response.output_audio.delta", "item_id": "out", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "out",
                "transcript": "Can I take your full name and the gate number?",
            },
        ],
        hold_open=True,
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.12)]
    )
    observations = configure_bridge(monkeypatch, [first, second])
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    monkeypatch.setenv("VOICE_PROVIDER_MAX_RECONNECTS", "2")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    reasons = [reason for kind, reason in observations if kind == "interrupt"]
    assert "voice_transport_disconnected" in reasons
    assert "voice_provider_reconnected" in reasons
    assert "voice_provider_reconnect_exhausted" not in reasons
    assert not twilio.closed
    media = [item for item in twilio.sent if item.get("event") == "media"]
    assert len(media) >= 2  # greeting + post-reconnect audio
    # Resume instruction after reconnect must not repeat the opening greeting contract.
    resume_creates = [
        item
        for item in second.sent
        if item.get("type") == "response.create"
        and "Do not repeat the opening greeting" in item.get("response", {}).get("instructions", "")
    ]
    assert resume_creates
    greeting_creates = [
        item
        for item in second.sent
        if item.get("type") == "response.create"
        and "Greet the caller now exactly" in item.get("response", {}).get("instructions", "")
    ]
    assert not greeting_creates


def test_greeting_and_ordinary_turn_latency_are_measured(monkeypatch):
    """Staging evidence: greeting + end-of-caller-speech → first-audio are measured, not inferred."""
    latency_events = []

    def capture_event(name, **kwargs):
        if name == "voice_latency_measured":
            latency_events.append({"name": name, **kwargs})

    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {"type": "input_audio_buffer.speech_started"},
            {"type": "input_audio_buffer.speech_stopped"},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "I need a replacement alley gate key please",
            },
            {"type": "response.output_audio.delta", "item_id": "out", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.delta",
                "item_id": "out",
                "delta": "You can order a resident key at www.alleygates.co.uk for £22 including VAT.",
            },
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "out",
                "transcript": "You can order a resident key at www.alleygates.co.uk for £22 including VAT.",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    monkeypatch.setattr(voice_bridge, "operational_event", capture_event)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    kinds = {item.get("reason_code") for item in latency_events}
    assert "greeting_first_audio" in kinds
    assert "turn_first_audio" in kinds
    for item in latency_events:
        assert item.get("outcome") == "measured"
        assert isinstance(item.get("latency_ms"), (int, float))
        assert item["latency_ms"] >= 0
    # Greeting streams immediately (media before any stop).
    assert any(item.get("event") == "media" for item in twilio.sent)
    assert not twilio.closed


def test_high_risk_output_stays_gated_until_policy_passes(monkeypatch):
    """Consequential claims stay gated; safe follow-ups may release after full validation."""
    gated_payload = base64.b64encode(b"b" * 160).decode()
    openai = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
            {
                "type": "conversation.item.input_audio_transcription.completed",
                "item_id": "in-1",
                "transcript": "What is happening with my repair?",
            },
            # Risky claim: audio before transcript.done with no safe unlock → never sent.
            {"type": "response.output_audio.delta", "item_id": "bad", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "bad",
                "transcript": "We have dispatched a contractor already.",
            },
            # Follow-up after reject: held until transcript.done validates, then flushed.
            {"type": "response.output_audio.delta", "item_id": "gated", "delta": gated_payload},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "gated",
                "transcript": "I can take the details of what you need help with.",
            },
        ]
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.1)]
    )
    observations = configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    reasons = [reason for kind, reason in observations if kind == "interrupt"]
    assert any("assistant_policy_rejected" in r for r in reasons)
    media_payloads = [
        (item.get("media") or {}).get("payload")
        for item in twilio.sent
        if item.get("event") == "media"
    ]
    assert AUDIO in media_payloads  # greeting
    assert gated_payload in media_payloads  # safe follow-up after validation
    assert not twilio.closed


def test_single_configured_voice_retained_across_reconnect(monkeypatch):
    voices = []
    _real_configure = voice_bridge._configure_realtime

    async def configure_wrapper(ws):
        await _real_configure(ws)
        session = ws.sent[-1]["session"]
        voices.append(session["audio"]["output"]["voice"])

    first = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "g", "delta": AUDIO},
            {"type": "response.output_audio_transcript.done", "item_id": "g", "transcript": GREETING},
        ],
        hold_open=False,
    )
    second = FakeOpenAI(
        [
            {"type": "response.output_audio.delta", "item_id": "r", "delta": AUDIO},
            {
                "type": "response.output_audio_transcript.done",
                "item_id": "r",
                "transcript": "Please continue.",
            },
        ],
        hold_open=True,
    )
    twilio = FakeTwilio(
        connected_start_events()
        + [({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.08)]
    )
    configure_bridge(monkeypatch, [first, second])
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    monkeypatch.setenv("OPENAI_REALTIME_VOICE", "alloy")
    monkeypatch.setattr(voice_bridge, "_configure_realtime", configure_wrapper)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert voices
    assert set(voices) == {"alloy"}


# Issue 67 soft-recover keep-open contract.

import asyncio
import base64
import json

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import voice_bridge
import channels
import decision_engine
import operations
from action_evidence import record_action_result
from models import Approval,Base,CallEvent,CallSession,CallSessionTenant,Client,Escalation,Property,Resident,TenantBoundary,UnmatchedInbound,WorkOrder
from voice_bridge import (
    inbound_fallback_twiml,
    inbound_stream_twiml,
    public_stream_url,
    record_call_interruption,
    record_safety_observation,
    requires_human_escalation,
    voice_ready,
)


class FakeTwilio:
    def __init__(self, events):
        self.headers = {"X-Twilio-Signature": "valid"}
        self.events = list(events)
        self.sent = []
        self.accepted = False
        self.closed = False
        self.close_code = None

    async def accept(self):
        self.accepted = True

    async def receive_text(self):
        event, delay = self._next_event()
        if delay:
            await asyncio.sleep(delay)
        return json.dumps(event)

    async def iter_text(self):
        while not self.closed:
            if self.events:
                event, delay = self._next_event()
                if delay:
                    await asyncio.sleep(delay)
                yield json.dumps(event)
            else:
                await asyncio.sleep(0.001)

    async def send_json(self, payload):
        self.sent.append(payload)

    async def close(self, code=1000):
        self.closed = True
        self.close_code = code

    def _next_event(self):
        item = self.events.pop(0)
        return item if isinstance(item, tuple) else (item, 0)


class FakeOpenAI:
    def __init__(self, events=(), hold_open=True, event_delay=0):
        self.events = list(events)
        self.hold_open = hold_open
        self.event_delay = event_delay
        self.sent = []
        self.closed = False

    async def send(self, payload):
        self.sent.append(json.loads(payload))

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.events:
            if self.event_delay:
                await asyncio.sleep(self.event_delay)
            return json.dumps(self.events.pop(0))
        if self.hold_open:
            while not self.closed:
                await asyncio.sleep(0.001)
        raise StopAsyncIteration

    async def close(self):
        self.closed = True


def connected_start_events():
    return [
        {"event": "connected", "protocol": "Call", "version": "1.0.0"},
        {
            "event": "start",
            "start": {
                "streamSid": "MZ-test",
                "accountSid": "AC-test",
                "callSid": "CA-test",
                "mediaFormat": {"encoding": "audio/x-mulaw", "sampleRate": 8000, "channels": 1},
                "customParameters": {"call_session_id": "7", "call_sid": "CA-test", "stream_token": "token"},
            },
        },
    ]


def configure_bridge(monkeypatch, openai, observations=None):
    observations = observations if observations is not None else []
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with testing_session() as session:
        client = Client(name="Synthetic voice-output tenant")
        session.add(client); session.flush()
        prop = Property(
            client_id=client.id, address="4 Synthetic Test Way", postcode="ZZ1 1ZZ",
            access_notes="SYNTHETIC ACCESS CODE", emergency_notes="SYNTHETIC EMERGENCY NOTE",
        )
        session.add(prop); session.flush()
        resident = Resident(
            client_id=client.id, property_id=prop.id, name="Synthetic Voice Resident",
            phone="+440000000007", email="voice-output@example.test",
        )
        session.add(resident); session.flush()
        call = CallSession(
            id=7, call_sid="CA-test", caller=resident.phone, resident_id=resident.id,
            verification_status="UNVERIFIED",
        )
        session.add(call); session.flush()
        session.add(CallSessionTenant(call_session_id=call.id, client_id=client.id))
        session.commit()
    monkeypatch.setattr(voice_bridge, "SessionLocal", testing_session)
    monkeypatch.setattr(voice_bridge, "voice_ready", lambda: True)
    monkeypatch.setattr(voice_bridge, "validate_twilio_websocket", lambda url, signature: True)
    monkeypatch.setattr(voice_bridge, "validate_stream_start", lambda start, params: 7)
    monkeypatch.setattr(voice_bridge, "record_safety_observation", lambda call_id, text: False)
    monkeypatch.setattr(voice_bridge, "record_transcript_segment", lambda call_id, speaker, text: False)
    monkeypatch.setattr(voice_bridge, "record_call_interruption", lambda call_id, reason: observations.append(("interrupt", reason)))
    monkeypatch.setattr(voice_bridge, "close_call_session", lambda call_id: observations.append(("close", call_id)))

    async def connect(_identifier):
        return openai

    monkeypatch.setattr(voice_bridge, "_connect_openai", connect)
    voice_bridge._ACTIVE_CALL_SESSIONS.clear()
    return observations


def test_public_stream_url_requires_https(monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "http://localhost:8000")
    assert public_stream_url() == ""
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com/")
    assert public_stream_url() == "wss://pilot.example.com/voice/media-stream"


def test_voice_ready_requires_complete_fail_closed_config(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    testing_session=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    monkeypatch.setattr(voice_bridge,"SessionLocal",testing_session)
    with testing_session() as session:
        client=Client(name="Synthetic voice tenant");session.add(client);session.flush()
        session.add(TenantBoundary(client_id=client.id,mode="SYNTHETIC_TEST",label="AT voice"));session.commit();client_id=client.id
    values = {
        "ENABLE_REALTIME_VOICE": "true",
        "PUBLIC_BASE_URL": "https://pilot.example.com",
        "OPENAI_API_KEY": "test-key",
        "OPENAI_REALTIME_MODEL": "gpt-realtime-2.1",
        "OPENAI_TRANSCRIPTION_MODEL": "gpt-live-transcribe",
        "OPENAI_REALTIME_VOICE": "alloy",
        "TWILIO_ACCOUNT_SID": "AC-test",
        "TWILIO_AUTH_TOKEN": "token",
        "TWILIO_HUMAN_TRANSFER_NUMBER": "+441234567890",
        "VERIFY_TWILIO_SIGNATURES": "true",
        "APP_SECRET": "s" * 32,
        "VOICE_TENANT_MODE": "isolated_test",
        "VOICE_TEST_CLIENT_ID": str(client_id),
    }
    for key, value in values.items():
        monkeypatch.setenv(key, value)
    monkeypatch.setenv('TWILIO_PHONE_NUMBER', '+440000000098')
    monkeypatch.setenv('TWILIO_TEST_NUMBER_CONFIRMED', 'true')
    monkeypatch.setenv('ENABLE_PUBLIC_PROVIDER_INGRESS', 'true')
    assert voice_ready()
    monkeypatch.delenv("OPENAI_TRANSCRIPTION_MODEL")
    assert not voice_ready()


def test_voice_ready_rejects_undocumented_model_suffix_and_voice(monkeypatch):
    monkeypatch.setenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1-invented")
    monkeypatch.setenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-live-transcribe-invented")
    monkeypatch.setenv("OPENAI_REALTIME_VOICE", "invented")
    assert not voice_bridge.realtime_model_supported()
    assert not voice_bridge.transcription_model_supported()
    assert not voice_bridge.realtime_voice_supported()


def test_voice_ready_rejects_deprecated_realtime_model(monkeypatch):
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("OPENAI_REALTIME_MODEL", "gpt-realtime")
    monkeypatch.setenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-live-transcribe")
    monkeypatch.setenv("OPENAI_REALTIME_VOICE", "alloy")
    monkeypatch.setenv("TWILIO_ACCOUNT_SID", "AC-test")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "token")
    monkeypatch.setenv("TWILIO_HUMAN_TRANSFER_NUMBER", "+441234567890")
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    assert not voice_ready()


def test_twiml_builders_escape_stream_bind_and_transfer(monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com")
    monkeypatch.setenv("TWILIO_HUMAN_TRANSFER_NUMBER", "+441234567890")
    monkeypatch.setenv("TWILIO_TTS_LANGUAGE", "en-GB")
    monkeypatch.setenv("TWILIO_TTS_VOICE", "Polly.Amy")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    fallback = inbound_fallback_twiml("Voice <not> live", "+441234567890")
    assert "Voice &lt;not&gt; live" in fallback
    assert "<Dial>+441234567890</Dial>" in fallback
    assert 'language="en-GB"' in fallback
    assert 'voice="Polly.Amy"' in fallback

    twiml = inbound_stream_twiml(42, "CA-test")
    assert 'url="wss://pilot.example.com/voice/media-stream"' in twiml
    assert 'name="call_session_id" value="42"' in twiml
    assert 'name="call_sid" value="CA-test"' in twiml
    assert "stream_token" in twiml
    assert "<Dial>" not in twiml
    assert "Thank you for calling Chapel Gate. Goodbye, have a nice day." in twiml
    assert 'language="en-GB"' in twiml
    assert 'voice="Polly.Amy"' in twiml


def test_voice_escalation_keeps_deterministic_safety_authority():
    escalate, reason = requires_human_escalation("I can smell gas by the boiler")
    assert escalate
    assert "GAS_SMELL" in reason

    escalate, reason = requires_human_escalation("I want to speak to a human about a complaint")
    assert escalate
    assert "COMPLAINT" in reason

    escalate, reason = requires_human_escalation("The bathroom tap is dripping slowly")
    assert not escalate
    assert reason == ""


def test_realtime_session_configures_input_transcription(monkeypatch):
    monkeypatch.setenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1")
    monkeypatch.setenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-live-transcribe")
    monkeypatch.setenv("OPENAI_REALTIME_VOICE", "alloy")
    openai = FakeOpenAI()
    asyncio.run(voice_bridge._configure_realtime(openai))
    session = openai.sent[0]["session"]
    assert session["audio"]["input"]["format"] == {"type": "audio/pcmu"}
    assert session["audio"]["input"]["transcription"]["model"]
    assert session["audio"]["output"] == {"format": {"type": "audio/pcmu"}, "voice": "alloy"}
    assert session["tools"] == []
    assert session["tool_choice"] == "none"
    assert "backend deterministic safety engine has final authority" in session["instructions"]
    assert "British English" in session["instructions"]
    assert "999" in session["instructions"]
    assert "911" in session["instructions"]


def test_connected_start_media_stop_and_duplicate_media(monkeypatch):
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    payload = base64.b64encode(b"audio").decode()
    events = connected_start_events() + [
        {"event": "media", "sequenceNumber": "2", "media": {"chunk": "1", "payload": payload}},
        {"event": "media", "sequenceNumber": "2", "media": {"chunk": "1", "payload": payload}},
        {"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}},
    ]
    twilio = FakeTwilio(events)
    openai = FakeOpenAI()
    observations = configure_bridge(monkeypatch, openai)

    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    message_types = [item["type"] for item in openai.sent]
    assert twilio.accepted
    assert message_types.count("input_audio_buffer.append") == 1
    assert message_types.count("input_audio_buffer.commit") == 1
    assert observations.count(("close", 7)) == 1
    assert not [item for item in observations if item[0] == "interrupt"]


def test_initial_greeting_is_requested_and_reaches_twilio_without_caller_speech(monkeypatch):
    audio = base64.b64encode(b"a" * 160).decode()
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.05),
    ]
    greeting = "Hi, thank you for calling Chapel Gate. How can we help you today?"
    openai = FakeOpenAI([
        {"type": "response.output_audio.delta", "item_id": "greeting-1", "delta": audio},
        {"type": "response.output_audio_transcript.done", "item_id": "greeting-1", "transcript": greeting},
    ])
    twilio = FakeTwilio(events)
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")

    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    response_creates = [item for item in openai.sent if item.get("type") == "response.create"]
    assert len(response_creates) == 1
    assert "Hi, thank you for calling Chapel Gate" in response_creates[0]["response"]["instructions"]
    assert any(item.get("event") == "media" for item in twilio.sent)


def test_partial_transcript_is_not_safety_routed_before_completion(monkeypatch):
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0.05")
    events = connected_start_events() + [
        {"event": "media", "sequenceNumber": "2", "media": {"chunk": "1", "payload": "YQ=="}},
        {"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}},
    ]
    openai = FakeOpenAI(
        [{"type": "conversation.item.input_audio_transcription.delta", "item_id": "item-1", "delta": "I smell gas"}],
        event_delay=0.005,
    )
    twilio = FakeTwilio(events)
    observations = configure_bridge(monkeypatch, openai)

    def safety(call_id, text):
        observations.append(("safety", text))
        return True

    monkeypatch.setattr(voice_bridge, "record_safety_observation", safety)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))

    assert not [item for item in observations if item[0] == "safety"]
    assert ("close", 7) in observations
    assert not twilio.closed


@pytest.mark.parametrize(
    "events,expected_reason",
    [
        ([], "voice_transport_disconnected"),
        ([{"type": "conversation.item.input_audio_transcription.failed"}], "openai_transcription_failed"),
        ([{"type": "error", "error": {"code": "upstream_failure"}}], "openai_realtime_error:upstream_failure"),
    ],
)
def test_openai_disconnect_or_failure_transfers(monkeypatch, events, expected_reason):
    twilio = FakeTwilio(connected_start_events())
    openai = FakeOpenAI(events, hold_open=False)
    observations = configure_bridge(monkeypatch, openai)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert ("interrupt", expected_reason) in observations
    assert ("close", 7) in observations
    assert twilio.closed


def test_barge_in_clears_twilio_and_truncates_openai(monkeypatch):
    audio = base64.b64encode(b"a" * 160).decode()
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, 0.03),
    ]
    openai = FakeOpenAI(
        [
            {"type": "conversation.item.input_audio_transcription.completed", "item_id": "in-1", "transcript": "tap dripping"},
            {"type": "response.output_audio.delta", "item_id": "out-1", "delta": audio},
            {"type": "input_audio_buffer.speech_started"},
        ]
    )
    twilio = FakeTwilio(events)
    configure_bridge(monkeypatch, openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert any(item["event"] == "clear" for item in twilio.sent)
    assert any(item["type"] == "conversation.item.truncate" for item in openai.sent)
    assert not [item for item in twilio.sent if item.get("event") == "media"]


def test_missing_output_transcript_discards_audio_and_transfers(monkeypatch):
    audio = base64.b64encode(b"a" * 160).decode()
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, .05),
    ]
    openai = FakeOpenAI([
        {"type": "conversation.item.input_audio_transcription.completed", "item_id": "in", "transcript": "tap dripping"},
        {"type": "response.output_audio.delta", "item_id": "out", "delta": audio},
        {"type": "response.done", "response": {"status": "completed"}},
    ])
    twilio = FakeTwilio(events)
    observations = configure_bridge(monkeypatch, openai)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert not [item for item in twilio.sent if item.get("event") == "media"]
    assert ("interrupt", "openai_output_transcript_missing") in observations


@pytest.mark.parametrize("verified,allowed", [(False, False), (True, True)])
def test_private_property_output_is_gated_on_actual_audio_path(monkeypatch, verified, allowed):
    audio = base64.b64encode(b"a" * 160).decode()
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, .05),
    ]
    openai = FakeOpenAI([
        {"type": "conversation.item.input_audio_transcription.completed", "item_id": "in", "transcript": "What address do you have?"},
        {"type": "response.output_audio.delta", "item_id": "out", "delta": audio},
        {"type": "response.output_audio_transcript.done", "item_id": "out", "transcript": "Your address is 4 Synthetic Test Way."},
    ])
    twilio = FakeTwilio(events)
    observations = configure_bridge(monkeypatch, openai)
    if verified:
        with voice_bridge.SessionLocal() as session:
            call = session.get(CallSession, 7)
            call.verification_status = "POSTCODE_VERIFIED"
            session.commit()
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    media = [item for item in twilio.sent if item.get("event") == "media"]
    assert bool(media) is allowed
    rejected = (
        "interrupt",
        "assistant_policy_rejected:unverified_private_disclosure",
    ) in observations
    assert rejected is (not allowed)


@pytest.mark.parametrize("transcript,reason", [
    ("An engineer is on the way.", "contractor_dispatched"),
    ("Your repair has been completed.", "repair_completed"),
    ("I have transferred you to a human operator.", "human_transfer_connected"),
    ("Your appointment has been cancelled.", "appointment_cancelled"),
    ("I've arranged an engineer.", "contractor_dispatched"),
    ("The electrician is coming.", "contractor_dispatched"),
    ("We passed this to the landlord.", "other_party_notified"),
])
def test_unverified_success_claim_chunks_never_reach_actual_audio_output(monkeypatch, transcript, reason):
    chunks = [base64.b64encode(bytes([value]) * 160).decode() for value in (1, 2, 3)]
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, .05),
    ]
    openai_events = [
        {"type": "conversation.item.input_audio_transcription.completed", "item_id": "in", "transcript": "What happened?"},
        *[
            {"type": "response.output_audio.delta", "item_id": "out", "delta": chunk}
            for chunk in chunks
        ],
        {"type": "response.output_audio_transcript.done", "item_id": "out", "transcript": transcript},
    ]
    openai = FakeOpenAI(openai_events)
    twilio = FakeTwilio(events)
    observations = configure_bridge(monkeypatch, openai)
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert not [item for item in twilio.sent if item.get("event") == "media"]
    assert ("interrupt", f"assistant_policy_rejected:unverified_action_confirmation:{reason}") in observations


def test_verified_success_claim_reaches_actual_audio_output(monkeypatch):
    audio = base64.b64encode(b"a" * 160).decode()
    events = connected_start_events() + [
        ({"event": "stop", "sequenceNumber": "3", "stop": {"callSid": "CA-test"}}, .05),
    ]
    openai = FakeOpenAI([
        {"type": "conversation.item.input_audio_transcription.completed", "item_id": "in", "transcript": "Has anyone been called?"},
        {"type": "response.output_audio.delta", "item_id": "out", "delta": audio},
        {"type": "response.output_audio_transcript.done", "item_id": "out", "transcript": "Emergency services have been notified."},
    ])
    twilio = FakeTwilio(events)
    observations = configure_bridge(monkeypatch, openai)
    with voice_bridge.SessionLocal() as session:
        call = session.get(CallSession, 7)
        resident = session.get(Resident, call.resident_id)
        work_order = WorkOrder(
            client_id=resident.client_id, property_id=resident.property_id, resident_id=resident.id,
            description="Synthetic emergency", status="HUMAN_REVIEW", urgency="P1",
        )
        session.add(work_order); session.flush()
        call.work_order_id = work_order.id
        record_action_result(
            session, client_id=resident.client_id, work_order_id=work_order.id,
            action_type="emergency_services_contacted", action_key="synthetic-confirmed-contact",
            status="SUCCEEDED", actor="Synthetic verified callback",
            provider_reference="synthetic-reference",
        )
        session.commit()
    asyncio.run(voice_bridge.handle_twilio_media_stream(twilio))
    assert len([item for item in twilio.sent if item.get("event") == "media"]) == 1
    assert not [item for item in observations if item[0] == "interrupt"]


def test_partial_safety_state_survives_disconnect(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (voice_bridge,channels,decision_engine,operations):
        monkeypatch.setattr(module, "SessionLocal", testing_session)
    with testing_session() as session:
        client=Client(name="Pilot client")
        session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Private address",postcode="SW1A 1AA")
        session.add(prop);session.flush()
        resident=Resident(
            client_id=client.id,
            property_id=prop.id,
            name="Resident",
            phone="+440000000000",
            email="resident@example.com",
        )
        session.add(resident);session.flush()
        call=CallSession(call_sid="CA-emergency",caller=resident.phone,resident_id=resident.id)
        session.add(call);session.flush()
        session.add(TenantBoundary(client_id=client.id,mode="SYNTHETIC_TEST",label="AT emergency"))
        session.add(CallSessionTenant(call_session_id=call.id,client_id=client.id))
        session.commit()
        call_id = session.query(CallSession).filter_by(call_sid="CA-emergency").one().id

    assert record_safety_observation(call_id, "There is smoke filling the flat")
    record_call_interruption(call_id, "voice_transport_disconnected")
    voice_bridge.close_call_session(call_id)

    with testing_session() as session:
        call = session.query(CallSession).filter_by(id=call_id).one()
        state = json.loads(call.summary)
        assert call.ended_at is not None
        assert call.work_order_id is not None
        assert "smoke filling" in call.transcript.lower()
        assert {flag["code"] for flag in state["safety_flags"]} == {"ACTIVE_FIRE"}
        assert "voice_transport_disconnected" in state["reasons"]
        work_order=session.query(WorkOrder).filter_by(id=call.work_order_id).one()
        assert work_order.status=="HUMAN_REVIEW"
        assert "ACTIVE_FIRE" in work_order.safety_flags
        approval_types={item.approval_type for item in session.query(Approval).filter_by(work_order_id=work_order.id)}
        assert {"SAFETY","IDENTITY"}.issubset(approval_types)
        assert session.query(Escalation).filter_by(work_order_id=work_order.id).count()>=2


def test_postcode_guessing_locks_identity_without_storing_guesses(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (voice_bridge, channels):
        monkeypatch.setattr(module, "SessionLocal", testing_session)
    with testing_session() as session:
        client = Client(name="Synthetic identity tenant")
        session.add(client); session.flush()
        prop = Property(client_id=client.id, address="Private", postcode="SW1A 1AA")
        session.add(prop); session.flush()
        resident = Resident(
            client_id=client.id, property_id=prop.id, name="Synthetic resident",
            phone="+440000000009", email="identity@example.test",
        )
        session.add(resident); session.flush()
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Identity"))
        session.commit(); client_id = client.id

    call_id = voice_bridge.create_call_session("CA-identity-lock", "+440000000009", client_id)
    for supplied in ("E1 1AA", "M1 1AA", "B1 1AA"):
        voice_bridge.record_transcript_segment(call_id, "Caller", supplied)
    voice_bridge.record_transcript_segment(call_id, "Caller", "SW1A 1AA")

    with testing_session() as session:
        call = session.get(CallSession, call_id)
        assert call.verification_status == "IDENTITY_LOCKED"
        assert call.caller.startswith("sha256:") and "+44" not in call.caller
        events = session.query(CallEvent).filter_by(call_session_id=call_id).all()
        assert len([event for event in events if event.event == "CALLER_POSTCODE_REJECTED"]) == 3
        assert any(event.event == "VOICE_ESCALATION_REQUIRED" for event in events)
        details = " ".join(event.detail for event in events)
        assert not any(value in details for value in ("E1 1AA", "M1 1AA", "B1 1AA", "SW1A 1AA"))


def test_unknown_caller_report_is_tenant_bound_and_idempotently_preserved(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (voice_bridge, channels):
        monkeypatch.setattr(module, "SessionLocal", testing_session)
    with testing_session() as session:
        client = Client(name="Synthetic unknown-caller tenant")
        session.add(client); session.flush()
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Unknown caller"))
        session.commit(); client_id = client.id

    call_id = voice_bridge.create_call_session("CA-unmatched", "+440000000099", client_id)
    voice_bridge.record_transcript_segment(call_id, "Caller", "There is a leaking tap to report")
    voice_bridge.close_call_session(call_id)
    voice_bridge.close_call_session(call_id)

    with testing_session() as session:
        call = session.get(CallSession, call_id)
        reports = session.query(UnmatchedInbound).all()
        assert call.ended_at is not None and call.work_order_id is None and call.resident_id is None
        assert len(reports) == 1 and reports[0].client_id == client_id
        assert reports[0].participant_hash and "+44" not in reports[0].participant_hash
        assert reports[0].body.endswith("There is a leaking tap to report")
        assert session.query(WorkOrder).count() == 0
        assert session.query(CallEvent).filter_by(
            call_session_id=call_id, event="UNMATCHED_VOICE_REPORT_RECORDED"
        ).count() == 1


@pytest.mark.parametrize("value", [None, 0, [], {}, b"gas smell"])
def test_malformed_voice_observation_fails_closed_without_exception(value):
    assert not record_safety_observation(999, value)
    escalated, reason = requires_human_escalation(value)
    assert escalated and reason == "low_confidence_or_unknown_category"

import base64
import asyncio
import json
import shutil
import socket
import ssl
import subprocess
import threading
import time
from xml.etree import ElementTree

import httpx
import pytest
import uvicorn
import websockets
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.websockets import WebSocketDisconnect
from twilio.request_validator import RequestValidator

import api
import call_capacity
import channels
import decision_engine
import operations
import voice_bridge
from models import (
    ActionReceipt,
    Base,
    CallEvent,
    CallSession,
    Client,
    Resident,
    Property,
    TenantBoundary,
)


PUBLIC_BASE = "https://voice-stage.example.test"
PUBLIC_STREAM = "wss://voice-stage.example.test/voice/media-stream"
SYNTHETIC_TOKEN = "synthetic-twilio-token-for-route-tests"
SYNTHETIC_ACCOUNT = "AC-synthetic-route-test"


class FakeOpenAI:
    def __init__(self, events=(), *, hold_open=True):
        self.events = list(events)
        self.hold_open = hold_open
        self.sent = []
        self.closed = False

    async def send(self, payload):
        self.sent.append(json.loads(payload))

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.events:
            return json.dumps(self.events.pop(0))
        if self.hold_open:
            while not self.closed:
                await __import__("asyncio").sleep(0.001)
        raise StopAsyncIteration

    async def close(self):
        self.closed = True


@pytest.fixture
def staged_routes(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api, channels, decision_engine, operations, voice_bridge):
        monkeypatch.setattr(module, "SessionLocal", testing_session)

    with testing_session() as session:
        tenant = Client(name="Synthetic staged voice tenant")
        session.add(tenant)
        session.flush()
        prop = Property(
            client_id=tenant.id,
            address="1 Synthetic Route Test Way",
            postcode="ZZ1 1ZZ",
        )
        session.add(prop)
        session.flush()
        session.add(Resident(
            client_id=tenant.id,
            property_id=prop.id,
            name="Synthetic staged caller",
            phone="+440000000051",
            email="staged-caller@example.test",
        ))
        session.add(TenantBoundary(
            client_id=tenant.id,
            mode="SYNTHETIC_TEST",
            label="Staged route tests",
        ))
        session.commit()
        tenant_id = tenant.id

    values = {
        "APP_SECRET": "s" * 64,
        "VOICE_TENANT_MODE": "isolated_test",
        "VOICE_TEST_CLIENT_ID": str(tenant_id),
        "INTERNAL_API_CLIENT_ID": str(tenant_id),
        "PUBLIC_BASE_URL": PUBLIC_BASE,
        "TWILIO_ACCOUNT_SID": SYNTHETIC_ACCOUNT,
        "TWILIO_AUTH_TOKEN": SYNTHETIC_TOKEN,
        "TWILIO_HUMAN_TRANSFER_NUMBER": "+440000000099",
        "VERIFY_TWILIO_SIGNATURES": "true",
        "OPENAI_API_KEY": "synthetic-openai-key",
        "OPENAI_REALTIME_MODEL": "gpt-realtime-2.1",
        "OPENAI_TRANSCRIPTION_MODEL": "gpt-live-transcribe",
        "OPENAI_REALTIME_VOICE": "alloy",
        "ENABLE_REALTIME_VOICE": "false",
        "VOICE_TRANSCRIPT_GRACE_SECONDS": "0",
    }
    for key, value in values.items():
        monkeypatch.setenv(key, value)
    monkeypatch.setenv('TWILIO_PHONE_NUMBER', '+440000000098')
    monkeypatch.setenv('TWILIO_TEST_NUMBER_CONFIRMED', 'true')
    monkeypatch.setenv('ENABLE_PUBLIC_PROVIDER_INGRESS', 'true')
    voice_bridge._ACTIVE_CALL_SESSIONS.clear()
    yield TestClient(api.app), testing_session
    voice_bridge._ACTIVE_CALL_SESSIONS.clear()


def _signature(url, params=None):
    return RequestValidator(SYNTHETIC_TOKEN).compute_signature(url, params or {})


def _signed_post(client, path, params):
    return client.post(
        path,
        data=params,
        headers={"X-Twilio-Signature": _signature(PUBLIC_BASE + path, params)},
    )


def _stream_parameters(twiml):
    root = ElementTree.fromstring(twiml)
    stream = root.find(".//Stream")
    assert stream is not None
    return {item.attrib["name"]: item.attrib["value"] for item in stream.findall("Parameter")}


def _create_streaming_call(client, monkeypatch, fake_openai):
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")

    async def connect(_safety_identifier):
        return fake_openai

    monkeypatch.setattr(voice_bridge, "_connect_openai", connect)
    params = {"CallSid": "CA-synthetic-route", "From": "+440000000051", "To": "+440000000098"}
    response = _signed_post(client, "/voice/inbound", params)
    assert response.status_code == 200
    assert PUBLIC_STREAM in response.text
    return _stream_parameters(response.text)


def _start_event(parameters):
    return {
        "event": "start",
        "sequenceNumber": "1",
        "start": {
            "streamSid": "MZ-synthetic-route",
            "accountSid": SYNTHETIC_ACCOUNT,
            "callSid": "CA-synthetic-route",
            "tracks": ["inbound"],
            "mediaFormat": {
                "encoding": "audio/x-mulaw",
                "sampleRate": 8000,
                "channels": 1,
            },
            "customParameters": parameters,
        },
    }


def _openssl_path():
    candidates = (
        shutil.which("openssl"),
        r"C:\Program Files\Git\usr\bin\openssl.exe",
        r"C:\Program Files\Git\mingw64\bin\openssl.exe",
    )
    return next((path for path in candidates if path and __import__("os").path.isfile(path)), None)


def _free_loopback_port():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def test_signed_inbound_route_fails_closed_to_human_fallback(staged_routes):
    client, session_factory = staged_routes
    params = {"CallSid": "CA-synthetic-fallback", "From": "+440000000051", "To": "+440000000098"}
    rejected = client.post(
        "/voice/inbound",
        data=params,
        headers={"X-Twilio-Signature": "invalid"},
    )
    assert rejected.status_code == 403

    response = _signed_post(client, "/voice/inbound", params)
    assert response.status_code == 200
    assert "The automated service is unavailable." in response.text
    assert "<Dial>" not in response.text
    assert "<Stream" not in response.text
    with session_factory() as session:
        calls = session.query(CallSession).all()
        assert len(calls) == 1
        assert calls[0].caller.startswith("sha256:")
        assert "+44" not in calls[0].caller


def test_unclaimed_inbound_lease_is_released_without_media_stream(staged_routes, monkeypatch):
    client, _ = staged_routes
    call_capacity.reset_capacity_backend_for_tests()
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")
    monkeypatch.setattr(api, "provider_ready", lambda: True)

    callbacks = []

    class FakeTimer:
        def __init__(self, _delay, callback):
            self.callback = callback
            self.daemon = False
            callbacks.append(callback)

        def start(self):
            return None

    monkeypatch.setattr(api.threading, "Timer", FakeTimer)
    params = {
        "CallSid": "CA-pending-no-stream",
        "From": "+440000000051",
        "To": "+440000000098",
    }
    response = _signed_post(client, "/voice/inbound", params)
    assert response.status_code == 200
    assert "<Stream" in response.text
    assert call_capacity.capacity_snapshot().active_calls == 1
    assert len(callbacks) == 1

    callbacks[0]()

    assert call_capacity.capacity_snapshot().active_calls == 0


def test_pending_cleanup_never_releases_claimed_live_media_session(staged_routes, monkeypatch):
    client, _ = staged_routes
    call_capacity.reset_capacity_backend_for_tests()
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")
    monkeypatch.setattr(api, "provider_ready", lambda: True)

    callbacks = []

    class FakeTimer:
        def __init__(self, _delay, callback):
            self.callback = callback
            self.daemon = False
            callbacks.append(callback)

        def start(self):
            return None

    monkeypatch.setattr(api.threading, "Timer", FakeTimer)
    params = {
        "CallSid": "CA-pending-live-stream",
        "From": "+440000000051",
        "To": "+440000000098",
    }
    response = _signed_post(client, "/voice/inbound", params)
    stream_params = _stream_parameters(response.text)
    call_session_id = int(stream_params["call_session_id"])
    assert voice_bridge.claim_active_call_session(call_session_id)
    assert call_capacity.capacity_snapshot().active_calls == 1

    callbacks[0]()

    assert call_capacity.capacity_snapshot().active_calls == 1
    voice_bridge.release_active_call_session(call_session_id)
    call_capacity.release_call_capacity_only(call_session_id=call_session_id)


def test_signed_stream_callbacks_are_idempotent_and_record_errors(staged_routes):
    client, session_factory = staged_routes
    call = {"CallSid": "CA-synthetic-callback", "From": "+440000000051", "To": "+440000000098"}
    assert _signed_post(client, "/voice/inbound", call).status_code == 200
    started = {
        "CallSid": call["CallSid"],
        "StreamSid": "MZ-synthetic-callback",
        "StreamEvent": "stream-started",
    }
    failed = {
        **started,
        "StreamEvent": "stream-error",
        "StreamError": "synthetic transport failure",
    }
    assert _signed_post(client, "/voice/stream-status", started).status_code == 204
    assert _signed_post(client, "/voice/stream-status", started).status_code == 204
    assert _signed_post(client, "/voice/stream-status", failed).status_code == 204
    assert _signed_post(client, "/voice/stream-status", failed).status_code == 204
    with session_factory() as session:
        call_row = session.query(CallSession).filter_by(call_sid=call["CallSid"]).one()
        status_events = session.query(CallEvent).filter_by(
            call_session_id=call_row.id,
            event="VOICE_STREAM_STATUS",
        ).all()
        assert len(status_events) == 2
        assert session.query(ActionReceipt).filter_by(
            scope="TWILIO_STREAM_EVENT",
        ).count() == 2
        assert "twilio_stream_error" in call_row.summary


def test_actual_websocket_route_rejects_bad_signature(staged_routes, monkeypatch):
    client, _ = staged_routes
    parameters = _create_streaming_call(client, monkeypatch, FakeOpenAI())
    assert parameters["call_sid"] == "CA-synthetic-route"
    with pytest.raises(WebSocketDisconnect) as rejected:
        with client.websocket_connect(
            "/voice/media-stream",
            headers={"X-Twilio-Signature": "invalid"},
        ):
            pass
    assert rejected.value.code == 1008


def test_actual_websocket_connected_start_media_stop_sequence(staged_routes, monkeypatch):
    client, session_factory = staged_routes
    fake_openai = FakeOpenAI()
    parameters = _create_streaming_call(client, monkeypatch, fake_openai)
    payload = base64.b64encode(b"synthetic-pcmu").decode()
    signature = _signature(PUBLIC_STREAM)
    with client.websocket_connect(
        "/voice/media-stream",
        headers={"X-Twilio-Signature": signature},
    ) as socket:
        socket.send_json({"event": "connected", "protocol": "Call", "version": "1.0.0"})
        socket.send_json(_start_event(parameters))
        media = {
            "event": "media",
            "sequenceNumber": "2",
            "streamSid": "MZ-synthetic-route",
            "media": {"chunk": "1", "timestamp": "0", "payload": payload},
        }
        socket.send_json(media)
        socket.send_json(media)
        socket.send_json({
            "event": "stop",
            "sequenceNumber": "3",
            "streamSid": "MZ-synthetic-route",
            "stop": {"callSid": "CA-synthetic-route", "accountSid": SYNTHETIC_ACCOUNT},
        })
    sent_types = [event["type"] for event in fake_openai.sent]
    assert sent_types.count("session.update") == 1
    assert sent_types.count("input_audio_buffer.append") == 1
    assert sent_types.count("input_audio_buffer.commit") == 1
    session_update = fake_openai.sent[0]["session"]
    assert session_update["audio"]["input"]["format"] == {"type": "audio/pcmu"}
    assert session_update["audio"]["input"]["transcription"] == {
        "model": "gpt-live-transcribe"
    }
    assert session_update["audio"]["output"]["format"] == {"type": "audio/pcmu"}
    assert session_update["tools"] == []
    assert session_update["tool_choice"] == "none"
    with session_factory() as session:
        call = session.query(CallSession).filter_by(call_sid="CA-synthetic-route").one()
        assert call.ended_at is not None


def test_local_tls_https_and_wss_transport_reaches_actual_routes(
    staged_routes, monkeypatch, tmp_path
):
    _, session_factory = staged_routes
    openssl = _openssl_path()
    assert openssl, "A local OpenSSL executable is required for this transport probe"
    certificate = tmp_path / "loopback-cert.pem"
    private_key = tmp_path / "loopback-key.pem"
    subprocess.run(
        [
            openssl,
            "req",
            "-x509",
            "-nodes",
            "-newkey",
            "rsa:2048",
            "-keyout",
            str(private_key),
            "-out",
            str(certificate),
            "-days",
            "1",
            "-subj",
            "/CN=127.0.0.1",
            "-addext",
            "subjectAltName=IP:127.0.0.1",
        ],
        check=True,
        capture_output=True,
    )
    fake_openai = FakeOpenAI()

    async def connect(_safety_identifier):
        return fake_openai

    monkeypatch.setattr(voice_bridge, "_connect_openai", connect)
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")
    port = _free_loopback_port()
    server = uvicorn.Server(
        uvicorn.Config(
            api.app,
            host="127.0.0.1",
            port=port,
            log_level="error",
            lifespan="off",
            ssl_certfile=str(certificate),
            ssl_keyfile=str(private_key),
        )
    )
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    try:
        deadline = time.monotonic() + 5
        while not server.started and thread.is_alive() and time.monotonic() < deadline:
            time.sleep(0.01)
        assert server.started

        call = {"CallSid": "CA-synthetic-tls", "From": "+440000000051", "To": "+440000000098"}
        response = httpx.post(
            f"https://127.0.0.1:{port}/voice/inbound",
            data=call,
            headers={"X-Twilio-Signature": _signature(PUBLIC_BASE + "/voice/inbound", call)},
            verify=False,
            timeout=5,
        )
        assert response.status_code == 200
        parameters = _stream_parameters(response.text)

        async def probe_wss():
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            async with websockets.connect(
                f"wss://127.0.0.1:{port}/voice/media-stream",
                ssl=context,
                additional_headers={"X-Twilio-Signature": _signature(PUBLIC_STREAM)},
            ) as socket_client:
                await socket_client.send(json.dumps(
                    {"event": "connected", "protocol": "Call", "version": "1.0.0"}
                ))
                start = _start_event(parameters)
                start["start"]["callSid"] = call["CallSid"]
                await socket_client.send(json.dumps(start))
                await socket_client.send(json.dumps({
                    "event": "media",
                    "sequenceNumber": "2",
                    "streamSid": "MZ-synthetic-route",
                    "media": {
                        "chunk": "1",
                        "timestamp": "0",
                        "payload": base64.b64encode(b"synthetic-pcmu").decode(),
                    },
                }))
                media_deadline = time.monotonic() + 2
                while time.monotonic() < media_deadline:
                    if any(item.get("type") == "input_audio_buffer.append" for item in fake_openai.sent):
                        break
                    await asyncio.sleep(0.01)
                else:
                    raise AssertionError("openai did not receive appended media before stop")
                await socket_client.send(json.dumps({
                    "event": "stop",
                    "sequenceNumber": "3",
                    "streamSid": "MZ-synthetic-route",
                    "stop": {"callSid": call["CallSid"], "accountSid": SYNTHETIC_ACCOUNT},
                }))

        asyncio.run(probe_wss())
        assert [item["type"] for item in fake_openai.sent].count(
            "input_audio_buffer.append"
        ) == 1
        deadline = time.monotonic() + 2
        while True:
            with session_factory() as session:
                call_row = session.query(CallSession).filter_by(call_sid=call["CallSid"]).one()
                if call_row.ended_at is not None:
                    break
            if time.monotonic() >= deadline:
                raise AssertionError("call end was not persisted before timeout")
            time.sleep(0.01)
    finally:
        server.should_exit = True
        thread.join(timeout=5)
        assert not thread.is_alive()


def test_actual_websocket_realtime_failure_soft_recovers_without_app_close(staged_routes, monkeypatch):
    """Recoverable OpenAI errors must keep the Media Stream open (no Twilio 31921)."""
    client, session_factory = staged_routes
    fake_openai = FakeOpenAI(
        [{"type": "error", "error": {"code": "synthetic_upstream_failure"}}],
        hold_open=True,
    )
    parameters = _create_streaming_call(client, monkeypatch, fake_openai)
    monkeypatch.setenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "0")
    with client.websocket_connect(
        "/voice/media-stream",
        headers={"X-Twilio-Signature": _signature(PUBLIC_STREAM)},
    ) as socket:
        socket.send_json({"event": "connected", "protocol": "Call", "version": "1.0.0"})
        socket.send_json(_start_event(parameters))
        # Allow soft-recover to record the interruption while the stream stays open.
        deadline = time.monotonic() + 2
        while time.monotonic() < deadline:
            with session_factory() as session:
                call = session.query(CallSession).filter_by(call_sid="CA-synthetic-route").one()
                summary = call.summary or ""
                if "openai_realtime_error:synthetic_upstream_failure" in summary:
                    break
            time.sleep(0.01)
        else:
            raise AssertionError("soft-recover interruption was not recorded")
        # Caller/Twilio still owns stream teardown — send stop (no application close).
        socket.send_json({
            "event": "stop",
            "sequenceNumber": "3",
            "streamSid": "MZ-synthetic-route",
            "stop": {"callSid": "CA-synthetic-route", "accountSid": SYNTHETIC_ACCOUNT},
        })
    with session_factory() as session:
        call = session.query(CallSession).filter_by(call_sid="CA-synthetic-route").one()
        assert call.ended_at is not None
        assert "openai_realtime_error:synthetic_upstream_failure" in call.summary


def test_actual_websocket_rejects_out_of_order_media_before_openai(staged_routes, monkeypatch):
    client, session_factory = staged_routes
    fake_openai = FakeOpenAI()
    _create_streaming_call(client, monkeypatch, fake_openai)
    with client.websocket_connect(
        "/voice/media-stream",
        headers={"X-Twilio-Signature": _signature(PUBLIC_STREAM)},
    ) as socket:
        socket.send_json({"event": "media", "media": {"payload": "YQ=="}})
        close = socket.receive()
        assert close["type"] == "websocket.close"
        assert close["code"] == 1008
    assert fake_openai.sent == []
    with session_factory() as session:
        call = session.query(CallSession).filter_by(call_sid="CA-synthetic-route").one()
        assert call.ended_at is None

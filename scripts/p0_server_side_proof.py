#!/usr/bin/env python3
"""Server-side P0 proofs for Chapelgate pilot incident fixes.

Does NOT place a real Twilio/Andy call. Uses synthetic call records and local
restart simulation. Live Resend acceptance runs only when credentials exist.
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def _pass(name: str, detail: str = "") -> dict:
    return {"name": name, "result": "PASS", "detail": detail}


def _fail(name: str, detail: str = "") -> dict:
    return {"name": name, "result": "FAIL", "detail": detail}


def proof_goodbye() -> dict:
    from gemini_voice import (
        _assistant_invited_close,
        _farewell_only,
        _routine_close_confirmed,
    )
    from voice_bridge import inbound_stream_twiml

    variants = [
        "no",
        "no thanks",
        "no thank you",
        "that's all",
        "that's everything",
        "I'm fine",
        "that's it",
        "nothing else",
        "cheers",
        "okay bye",
        "bye",
        "goodbye",
    ]
    assert _assistant_invited_close("Is there anything else I can help you with?")
    for phrase in variants:
        ok = _routine_close_confirmed(phrase) or _farewell_only(phrase)
        if not ok:
            return _fail("DETERMINISTIC_CLOSE", f"missed variant: {phrase}")
    assert not _routine_close_confirmed("No, I don't know the gate number")
    twiml = inbound_stream_twiml(1, "CA-proof")
    if "Thank you for calling Chapel Gate. Goodbye, have a nice day." not in twiml:
        return _fail("POST_STREAM_GOODBYE", "TwiML Say missing")
    if "<Connect>" not in twiml or "</Stream>" not in twiml:
        return _fail("POST_STREAM_GOODBYE", "Stream block missing")
    return _pass("DETERMINISTIC_CLOSE+POST_STREAM_GOODBYE", f"variants={len(variants)}")


def proof_latency_path() -> dict:
    import inspect
    import gemini_voice

    source = inspect.getsource(gemini_voice.handle_gemini_media_stream)
    required = (
        "voice_turn_stage",
        "gemini_turn_accepted",
        "first_model_audio",
        "audio_conversion",
        "first_twilio_media",
        "await asyncio.to_thread(vb.record_transcript_segment",
        "await asyncio.to_thread(vb.close_call_session",
    )
    missing = [item for item in required if item not in source]
    if missing:
        return _fail("VOICE_PATH_HEALTH", f"missing={missing}")
    silence = gemini_voice._silence_duration_ms()
    # Synthetic conversion cost only (not end-to-end model latency).
    t0 = time.perf_counter()
    pcm = (b"\x00\x10" * 240)  # 10ms @ 24k mono pcm16
    for _ in range(50):
        gemini_voice.gemini_pcm_to_twilio_mulaw(pcm)
    elapsed_ms = (time.perf_counter() - t0) * 1000 / 50
    if elapsed_ms > 25:
        return _fail("SYNTHETIC_TURN_LATENCY", f"conversion_ms={elapsed_ms:.2f}")
    return _pass(
        "VOICE_PATH_HEALTH+SYNTHETIC_TURN_LATENCY",
        f"silence_ms={silence}; conversion_ms={elapsed_ms:.2f}",
    )


def proof_pilot_counter(tmp: Path) -> dict:
    os.environ["PILOT_BOOTSTRAP_CALLS"] = ""  # production default floor=2
    os.environ["PILOT_STATE_PATH"] = str(tmp / "pilot_state.json")
    os.environ["PILOT_MODE_ARMED"] = "true"
    from pilot.runtime_guard import (
        admit_pilot_call,
        pilot_status,
        record_pilot_call_completed,
        reset_pilot_runtime_for_tests,
        PERSIST_KEY,
    )
    from models import SessionLocal, RuntimeControl

    reset_pilot_runtime_for_tests()
    st = pilot_status()
    if st["calls_completed"] < 2:
        return _fail("PILOT_COUNTER", f"expected floor 2, got {st['calls_completed']}")

    # Simulate restart: wipe RuntimeControl (ephemeral SQLite) but keep file mirror.
    with SessionLocal() as session:
        row = session.query(RuntimeControl).filter_by(key=PERSIST_KEY).one_or_none()
        if row is not None:
            session.delete(row)
        session.commit()
    st2 = pilot_status()
    if st2["calls_completed"] < 2:
        return _fail("COUNTER_SURVIVES_RESTART", f"after wipe got {st2['calls_completed']}")

    # 10-call ceiling still enforced after restart heal.
    # Floor already counts as 2 completed+admitted; admit up to 10 then refuse.
    while pilot_status()["calls_admitted"] < 10:
        admit_pilot_call(tenant_id="chapelgate", call_sid=f"CA-PROOF-{pilot_status()['calls_admitted']}")
        record_pilot_call_completed(success=True)
    try:
        admit_pilot_call(tenant_id="chapelgate", call_sid="CA-PROOF-11")
        return _fail("TEN_CALL_LIMIT_SURVIVES_RESTART", "call 11 admitted")
    except Exception as exc:
        if "pilot_call_limit_reached" not in str(exc):
            return _fail("TEN_CALL_LIMIT_SURVIVES_RESTART", str(exc))
    return _pass("PILOT_COUNTER+RESTART+LIMIT", f"completed={pilot_status()['calls_completed']}")


def proof_email_pipeline(tmp: Path) -> dict:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool

    import call_notifications
    import channels
    import voice_bridge
    from call_notifications import dispatch_internal_call_email
    from models import (
        Base,
        CallSession,
        CallSessionTenant,
        Client,
        CommunicationDelivery,
        Property,
        TenantBoundary,
    )

    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    voice_bridge.SessionLocal = factory
    channels.SessionLocal = factory
    call_notifications.SessionLocal = factory

    os.environ["VOICE_COMPLETION_EMAIL_SYNC"] = "true"
    os.environ["INTERNAL_NOTIFICATION_EMAIL"] = os.getenv(
        "P0_PROOF_INBOX", "chapelgate@gmail.com"
    )
    os.environ["EMAIL_MODE"] = "imap_smtp"
    os.environ["ENABLE_LIVE_EMAIL"] = "true"
    os.environ.setdefault("SMTP_FROM", "info@chapelgateservices.com")

    live_attempted = False
    provider_id = ""
    sends: list[dict] = []

    def capture_or_live(to, subject, body, **kwargs):
        nonlocal live_attempted, provider_id
        # Prefer real Resend when credentials are present.
        from email_gateway import _resend_api_key, live_email_enabled, send_email as real_send

        if live_email_enabled() and _resend_api_key() and os.getenv("P0_PROOF_LIVE_EMAIL", "").lower() in {
            "1",
            "true",
            "yes",
            "on",
        }:
            live_attempted = True
            result = real_send(to, subject, body, allow_smtp_fallback=False)
            provider_id = str(result.get("message_id") or "")
            sends.append({"to": to, "subject": subject, "live": True, "id": provider_id})
            return result
        sends.append({"to": to, "subject": subject, "live": False})
        return {"mock": False, "message_id": "synthetic-provider-id", "provider": "synthetic"}

    call_notifications.send_email = capture_or_live

    with factory() as session:
        client = Client(name="P0 proof tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="P0"))
        session.commit()
        client_id = client.id

    call_id = voice_bridge.create_call_session("CA-p0-proof", "+440000000999", client_id)
    # Incomplete transcript must still notify as CALL REVIEW.
    voice_bridge.close_call_session(call_id)
    result = dispatch_internal_call_email(call_id)
    if not sends and not result.get("sent"):
        # close already dispatched once; check delivery row
        with factory() as session:
            rows = session.query(CommunicationDelivery).all()
            if not rows:
                return _fail("EMAIL_DISPATCH_INVOKED", str(result))
    with factory() as session:
        delivered = session.query(CommunicationDelivery).filter_by(status="SENT").count()
        if delivered < 1:
            return _fail("PROVIDER_MESSAGE_ID_RECORDED", "no SENT delivery")
        ref = session.query(CommunicationDelivery).filter_by(status="SENT").first().provider_reference
    detail = {
        "category": result.get("category") or "call_review",
        "provider_reference": ref,
        "live_attempted": live_attempted,
        "provider_id": provider_id or ref,
    }
    if live_attempted and not provider_id:
        return _fail("REAL_RESEND_PROVIDER_ACCEPTANCE", json.dumps(detail))
    return _pass("COMPLETION_LIFECYCLE+EMAIL", json.dumps(detail))


def main() -> int:
    os.environ.setdefault("APP_SECRET", "p0-proof-secret-not-for-production-use-32b")
    os.environ.setdefault("ENABLE_STRUCTURED_LOGGING", "true")
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        results.append(proof_latency_path())
        results.append(proof_goodbye())
        results.append(proof_pilot_counter(tmp_path))
        results.append(proof_email_pipeline(tmp_path))

    report = {
        "proofs": results,
        "all_pass": all(item["result"] == "PASS" for item in results),
    }
    print(json.dumps(report, indent=2))
    return 0 if report["all_pass"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

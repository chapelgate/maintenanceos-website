import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import call_notifications
import channels
import voice_bridge
from call_notifications import (
    CATEGORY_KEY,
    CATEGORY_MASTER_KEY,
    CATEGORY_REPAIR,
    build_internal_email,
    classify_call_category,
    dispatch_internal_call_email,
    extract_call_details,
)
from models import (
    ActionReceipt,
    Base,
    CallSession,
    CallSessionTenant,
    Client,
    CommunicationDelivery,
    Property,
    TenantBoundary,
    WorkOrder,
)


def _factory():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    return factory


def test_categories_distinguish_repair_key_and_master_key():
    assert classify_call_category("The alley gate lock is broken and needs repair") == CATEGORY_REPAIR
    assert classify_call_category("I want to order a key from the website for £22") == CATEGORY_KEY
    assert classify_call_category("I need a master key for our housing association") == CATEGORY_MASTER_KEY
    subject, body = build_internal_email(
        extract_call_details(
            "Caller: My name is Sam Taylor\nCaller: Gate number 42 in Wirral is stuck\nCaller: Callback 0151 000 0000",
            job_reference="CG-000042",
        )
        | {"category": CATEGORY_REPAIR}
    )
    assert "[REPAIR]" in subject
    assert "Gate number: 42" in body
    assert "Wirral" in body
    master_subject, master_body = build_internal_email(
        {"category": CATEGORY_MASTER_KEY, "job_reference": "CG-1", "summary": "x", "transcript": "y"}
    )
    assert "MASTER KEY APPLICATION" in master_subject
    assert "RESTRICTED MASTER-KEY APPLICATION" in master_body
    key_subject, key_body = build_internal_email(
        {"category": CATEGORY_KEY, "job_reference": "CG-2", "summary": "x", "transcript": "y"}
    )
    assert "[KEY REQUEST]" in key_subject
    assert "KEY / RESIDENT KEY" in key_body


def test_close_call_sends_idempotent_internal_email(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(voice_bridge, "SessionLocal", factory)
    monkeypatch.setattr(channels, "SessionLocal", factory)
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("VOICE_COMPLETION_EMAIL_SYNC", "true")
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "imap_smtp")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.test")
    monkeypatch.setenv("SMTP_USERNAME", "user")
    monkeypatch.setenv("SMTP_PASSWORD", "pass")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.test")

    sends = []

    def fake_send(to, subject, body, **_kwargs):
        sends.append({"to": to, "subject": subject, "body": body})
        return {"mock": False, "message_id": "<real-1@test>"}

    monkeypatch.setattr(call_notifications, "send_email", fake_send)

    with factory() as session:
        client = Client(name="Notify tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Notify"))
        session.commit()
        client_id = client.id

    call_id = voice_bridge.create_call_session("CA-notify-1", "+440000000111", client_id)
    voice_bridge.record_transcript_segment(
        call_id,
        "Caller",
        "My name is Alex Reed. Gate number 17 in Sefton is broken and needs repair. Callback 07000000000.",
    )
    voice_bridge.close_call_session(call_id)
    voice_bridge.close_call_session(call_id)

    assert len(sends) == 1
    assert sends[0]["to"] == "chapelgate@gmail.com"
    assert "[REPAIR]" in sends[0]["subject"]
    assert "CG-" in sends[0]["subject"]

    with factory() as session:
        assert session.query(WorkOrder).count() == 1
        assert session.query(CommunicationDelivery).filter_by(status="SENT").count() == 1
        assert session.query(ActionReceipt).filter_by(scope="VOICE_INTERNAL_EMAIL").count() == 1


def test_email_failure_does_not_lose_persisted_call(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(voice_bridge, "SessionLocal", factory)
    monkeypatch.setattr(channels, "SessionLocal", factory)
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("VOICE_COMPLETION_EMAIL_SYNC", "true")
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "imap_smtp")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.test")
    monkeypatch.setenv("SMTP_USERNAME", "user")
    monkeypatch.setenv("SMTP_PASSWORD", "pass")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.test")

    def boom(*_a, **_k):
        raise RuntimeError("smtp_down")

    monkeypatch.setattr(call_notifications, "send_email", boom)

    with factory() as session:
        client = Client(name="Fail tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Fail"))
        session.commit()
        client_id = client.id

    call_id = voice_bridge.create_call_session("CA-notify-fail", "+440000000112", client_id)
    voice_bridge.record_transcript_segment(call_id, "Caller", "I need to order a key please")
    voice_bridge.close_call_session(call_id)

    with factory() as session:
        call = session.get(CallSession, call_id)
        assert call.ended_at is not None
        assert call.work_order_id is not None
        delivery = session.query(CommunicationDelivery).one()
        assert delivery.status == "FAILED"
        assert delivery.failure_code == "RuntimeError"


def test_call_review_fallback_still_sends(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "imap_smtp")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.test")
    monkeypatch.setenv("SMTP_USERNAME", "user")
    monkeypatch.setenv("SMTP_PASSWORD", "pass")
    monkeypatch.setenv("SMTP_FROM", "noreply@example.test")
    sends = []
    monkeypatch.setattr(
        call_notifications,
        "send_email",
        lambda to, subject, body, **_k: sends.append(subject) or {"mock": False, "message_id": "id-1"},
    )
    with factory() as session:
        client = Client(name="Review tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Review"))
        call = CallSession(call_sid="CA-review", caller="sha256:abc", transcript="")
        session.add(call)
        session.flush()
        session.add(CallSessionTenant(call_session_id=call.id, client_id=client.id))
        session.commit()
        call_id = call.id
    result = dispatch_internal_call_email(call_id)
    assert result["sent"] is True
    assert result["category"] == "call_review"
    assert any("[CALL REVIEW]" in s for s in sends)


def test_mock_email_is_not_marked_sent(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "mock")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "false")
    with factory() as session:
        client = Client(name="Mock tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Mock"))
        call = CallSession(call_sid="CA-mock", caller="sha256:abc", transcript="Caller: gate repair needed")
        session.add(call)
        session.flush()
        session.add(CallSessionTenant(call_session_id=call.id, client_id=client.id))
        session.commit()
        call_id = call.id
    result = dispatch_internal_call_email(call_id)
    assert result["reason"] == "live_email_disabled"
    with factory() as session:
        assert session.query(CommunicationDelivery).one().status == "FAILED"

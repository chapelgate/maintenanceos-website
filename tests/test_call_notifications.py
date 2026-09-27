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
    assert classify_call_category("I want to order a key from the website for Â£22") == CATEGORY_KEY
    assert classify_call_category("I need a master key for our housing association") == CATEGORY_MASTER_KEY
    subject, body = build_internal_email(
        extract_call_details(
            "Caller: My name is Sam Taylor\nCaller: Gate number 42 in Wirral is stuck\nCaller: Callback 0151 000 0000",
            job_reference="CG-000042",
        )
        | {"category": CATEGORY_REPAIR}
    )
    assert "[REPAIR]" in subject
    assert "Gate Number: 42" in body
    assert "Wirral" in body
    master_subject, master_body = build_internal_email(
        {"category": CATEGORY_MASTER_KEY, "job_reference": "CG-1", "summary": "x", "transcript": "y"}
    )
    assert "MASTER KEY APPLICATION" in master_subject
    assert "MASTER-KEY ENQUIRY" in master_body
    key_subject, key_body = build_internal_email(
        {"category": CATEGORY_KEY, "job_reference": "CG-2", "summary": "x", "transcript": "y"}
    )
    assert "[KEY REQUEST]" in key_subject
    assert "KEY ORDER / ENQUIRY" in key_body


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


def test_call_review_sends_when_pilot_resend_ready(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "mock")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "false")
    monkeypatch.setenv("SMTP_FROM", "info@chapelgateservices.com")
    monkeypatch.setenv("RESEND_API_KEY", "re_test_key")
    sends = []
    monkeypatch.setattr(
        call_notifications,
        "send_email",
        lambda to, subject, body, **_k: sends.append(subject)
        or {"mock": False, "message_id": "resend-1"},
    )
    monkeypatch.setattr(call_notifications, "pilot_resend_ready", lambda: True)
    monkeypatch.setattr(call_notifications, "live_email_enabled", lambda: False)
    with factory() as session:
        client = Client(name="Pilot resend tenant")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="Pilot"))
        call = CallSession(call_sid="CA-pilot-resend", caller="sha256:abc", transcript="")
        session.add(call)
        session.flush()
        session.add(CallSessionTenant(call_session_id=call.id, client_id=client.id))
        session.commit()
        call_id = call.id
    result = dispatch_internal_call_email(call_id)
    assert result["sent"] is True
    assert any("[CALL REVIEW]" in s for s in sends)


def test_mock_email_is_not_marked_sent(monkeypatch):
    factory = _factory()
    monkeypatch.setattr(call_notifications, "SessionLocal", factory)
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    monkeypatch.setenv("EMAIL_MODE", "mock")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "false")
    monkeypatch.delenv("PILOT_MODE_ARMED", raising=False)
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


def test_mixed_repair_key_master_email_is_sectioned_and_repair_first():
    transcript = """Assistant: How can we help?
Caller: The lock's broken on gate 921.
Assistant: Is that Wirral or Sefton?
Caller: Sefton.
Assistant: Could you give me your details?
Caller: My name is Andrew Cartwright and my number is 07755 226746. I live at 18 Brisbane Avenue, Wallasey.
Assistant: So gate 921 in Sefton, your name's Andrew Cartwright, your number is 07755 226746, and you're at 18 Brisbane Avenue, Wallasey.
Caller: I've ordered the key already. How do I get an update?
Caller: I want your master key.
"""
    details = extract_call_details(transcript, job_reference="CG-000028")
    subject, body = build_internal_email(details)
    assert subject.startswith("[REPAIR]")
    assert "Chapelgate Alleygate Repair Call Report" in body
    assert "KEY ORDER / ENQUIRY" in body
    assert "MASTER-KEY ENQUIRY" in body
    assert body.index("Chapelgate Alleygate Repair Call Report") < body.index("KEY ORDER / ENQUIRY") < body.index("MASTER-KEY ENQUIRY")
    assert "Gate Number: 921" in body
    assert "Area: Sefton" in body
    assert "Fault Details: The lock's broken" in body
    assert "Resident Name: Andrew Cartwright" in body
    assert "Contact Number: 07755 226746" in body
    assert "Address: 18 Brisbane Avenue, Wallasey" in body
    assert "Address: Assistant:" not in body
    assert "FULL TRANSCRIPT" in body


def test_live_garbled_call_uses_confirmed_repair_readback_and_separates_topics():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: sweet potato and alligator we pass
Assistant: Right, I can help with that. Is the gate in Wirral or Sefton?
Caller: world
Assistant: Got it. And do you know the gate number?
Caller: 21
Assistant: Thanks. Can you tell me what the problem is with the gate?
Caller: Yes, it's got a uh soap stock in the walk.
Assistant: I see. Could you also tell me your name, your callback number, and your own address?
Caller: Yes, that's the car right there. 75227746. My address is 20 Wexford Way, Widnes, CH459JX.
Assistant: Thank you. So, just to confirm, the problem is an alley gate with a key stuck in the lock, at gate 21 in Wirral. And your details are that your name's Mick, your number is 07752227746, and your address is 24 Wexford Way, Wirral, CH45 9JX. Your job reference is CG-000030. Is there anything else I can help with?
Caller: Yes, can I have all the master key as well?
Assistant: I understand. Master keys are restricted, so they're not ordered through the website. To apply for one, you'll need to email info@alleygates.co.uk from an official organisation or work email.
Caller: I've already ordered the cake. What's holding us up? How long will it take?
Assistant: Right, you should have received a confirmation email with your order number. If you want an update, just reply to that email. Keys are sent by Royal Mail, and tracking info is emailed when it's dispatched.
Caller: I also want to order, okay?
Assistant: You can do that online at alleygates.co.uk. Keys are currently Â£22, including VAT and recorded delivery.
Caller: There's a car blocking the alleyway.
Caller: Yeah, so we keep leaving the gates open.
Caller: I think that the neighbor keeps vandalizing the lock.
"""
    details = extract_call_details(transcript, job_reference="CG-000030")
    subject, body = build_internal_email(details)

    assert subject == "[REPAIR] Gate 21 - CG-000030"
    assert "Chapelgate Alleygate Repair Call Report" in body
    assert "Job ID: CG-000030" in body
    assert "Gate Number: 21" in body
    assert "Resident Name: not collected" in body
    assert "Contact Number: not collected" in body
    assert "Address: 20 Wexford Way, Widnes" in body
    assert "Postcode: CH45 9JX" in body
    assert "Fault Details: an alley gate with a key stuck in the lock" in body
    assert "KEY ORDER / ENQUIRY" in body
    assert "MASTER-KEY ENQUIRY" in body
    assert body.index("Chapelgate Alleygate Repair Call Report") < body.index("KEY ORDER / ENQUIRY") < body.index("MASTER-KEY ENQUIRY")
    assert "car blocking the alleyway" in body
    assert "vandalizing the lock" in body
    assert body.index("OTHER INFORMATION") < body.index("FULL TRANSCRIPT")






def test_cg31_confirmation_readback_wins_over_garbled_raw_stt():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: Vittorio Renoir di GK
Assistant: You can order keys online at alleygates.co.uk. The current price is £22, which includes VAT and recorded delivery. Would you like to order one that way?
Caller: No, I want to do it on the phone.
Assistant: Okay, I understand. To arrange payment by cash or bank transfer you'll need to speak directly with our team. I can transfer you to one of them now if you like?
Caller: Can you
Assistant: Okay. Just
Caller: I report I can report and navigate repair.
Assistant: Yes, I can help with that. Can you tell me whether the gate is in Wirral or Sefton? Also, do you know the gate number and what's the problem with it? Then, if I could have your name, your address, and a contact number, I can get that reported for you. What are those details, please?
Caller: number 625 Mr Andrew Carl 18 Brisbane Avenue Wallacia Wattle CH459JX Telephone number 0775226746 and the gate has been vandalized the lock is missing.
Assistant: Thanks, Mr Carl. So, that's gate 625, located at 18 Brisbane Avenue. The lock is missing due to vandalism. I have your contact number and your address details. Your job reference is CG-000031. Someone will be able to look at it within 24 to 48 hours. Is there anything else I can help you with today?
Caller: WhatsApp
Assistant: Thank you for calling Chapel Gate. Goodbye, have a nice day.
"""
    details = extract_call_details(transcript, job_reference="CG-000031")
    subject, body = build_internal_email(details)

    assert subject == "[REPAIR] Gate 625 - CG-000031"
    assert "Resident Name: Andrew Carl" in body
    assert "Contact Number: 0775226746" in body
    assert "Address: 18 Brisbane Avenue" in body
    assert "Postcode: CH45 9JX" in body
    assert "Area: not collected" in body
    assert "Fault Details: the lock is missing" in body
    assert "New key order enquiry: Yes" in body
    assert "Telephone ordering requested: Yes" in body
    assert "Outcome: no key order was taken during the call; caller was directed to alleygates.co.uk." in body
    assert "Order update route:" not in body
    assert "number 625 Mr Andrew Carl" not in body.split("OTHER INFORMATION", 1)[1].split("FULL TRANSCRIPT", 1)[0]


def test_cg32_caller_correction_and_confirmed_contact_are_authoritative():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: need to report for navigate repair
Assistant: Okay, I can help with that. Is the gate in Wirral or Sefton? And do you know the gate number?
Caller: then it's gate 421.
Assistant: Thanks. And what's the problem with it, please? Also, may I have your name, contact number, and your full address, please?
Assistant: Okay, thanks. And your name, contact number, and your address, please?
Caller: The address is 18 Brisbane Avenue. Wallacey. Wirral. CH45 9JX.
Caller: My telephone number is 07752226746.
Assistant: Thanks. Just to confirm then: it's gate number 421 and the keys are spinning around. Your name is Tony, and you're at 18 Brisbane Avenue, Wallasey, Wirral, CH45 9JX. Your contact number is 07752 226746. And we've got the job reference CG-000032. Is all that correct?
Caller: My name is Andrew Cartwright.
Assistant: My apologies, Andrew Cartwright. Thanks for correcting that. Is everything else correct though?
Caller: Yes.
"""
    details = extract_call_details(transcript, job_reference="CG-000032")
    subject, body = build_internal_email(details)

    assert subject == "[REPAIR] Gate 421 - CG-000032"
    assert "Resident Name: Andrew Cartwright" in body
    assert "Contact Number: 07752226746" in body
    assert "Address: 18 Brisbane Avenue, Wallasey, Wirral" in body
    assert "Postcode: CH45 9JX" in body
    assert "Area: Wirral" in body
    assert "Fault Details: the keys are spinning around" in body


def test_cg33_never_uses_assistant_invented_phone_number():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: need to report the now we gave tweet there.
Assistant: Okay, thank you. First, could you tell me whether the gate is in Wirral or Sefton? And do you know the gate number?
Caller: tomorrow on S. Hold on, let me just find the
Caller: 368
Assistant: Thanks, I've got that. Can you tell me what the problem is with the gate? Also, may I have your name, your own address including postcode, and a contact number?
Caller: Yeah, the gate is got a damaged lock.
Assistant: Thank you. So, just to confirm, that's a damaged lock on gate 368 in Wirral. I still need your name, full address and a contact number, then I can process this for you.
Caller: Andrew Top 1 70 18 Brisbane Avenue, Lawson, ACT, 2617 , Australia
Assistant: Thank you. Just to make sure everything's correct, I have your details as Andrew Top, 18 Brisbane Avenue, Wallasey, Wirral, CH45 9DX, reporting a damaged lock on alley gate 368 in Wirral, and your contact number is 0795 1234567. The job reference is CG-000033. Is all of that correct?
Caller: zeigen, wie sie meine Kontaktnummer auf dem Gerät haben.
Assistant: Okay, my apologies. I must have misheard that. Could you please provide your contact number now, then?
Caller: Where did you get the aluminum from?
Assistant: I apologize for the confusion. I may have mistakenly noted that down. Could you please provide your correct contact number now?
Caller: Ja. 775226746
Assistant: Thank you. So I've updated that to 07752 26746. Is everything else correct now?
Caller: répondre
Assistant: Thank you for confirming. I'll get this processed for you now. Thank you for calling Chapel Gate. Goodbye, have a nice day.
"""
    details = extract_call_details(transcript, job_reference="CG-000033")
    subject, body = build_internal_email(details)

    assert subject == "[REPAIR] Gate 368 - CG-000033"
    assert "Resident Name: Andrew Top" in body
    assert "Contact Number: not collected" in body
    assert "Address: 18 Brisbane Avenue, Lawson, ACT, 2617 , Australia" in body
    assert "Postcode: not collected" in body
    assert "Area: not collected" in body
    assert "0795 1234567" not in body.split("FULL TRANSCRIPT", 1)[0]
    assert "07752 26746" not in body.split("FULL TRANSCRIPT", 1)[0]
    assert "CH45 9DX" not in body.split("FULL TRANSCRIPT", 1)[0]
    assert "Fault Details: a damaged lock" in body






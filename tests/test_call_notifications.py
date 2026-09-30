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


def test_key_email_always_renders_captured_caller_details():
    details = {
        "category": CATEGORY_KEY,
        "job_reference": "CG-000039",
        "caller_name": "Andrew Cartwright",
        "callback_number": "07755 226746",
        "caller_address": "18 Brisbane Avenue, Wallasey",
        "postcode": "CH45 9JX",
        "area": "Wirral",
        "gate_number": "421",
        "transcript": "Caller: I need to order a key from the website.",
    }
    subject, body = build_internal_email(details)
    assert "[KEY REQUEST]" in subject
    assert "CALLER DETAILS" in body
    assert "Name: Andrew Cartwright" in body
    assert "Contact Number: 07755 226746" in body
    assert "Address: 18 Brisbane Avenue, Wallasey" in body
    assert "Postcode: CH45 9JX" in body
    assert "Area: Wirral" in body
    assert "Gate Number: 421" in body


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
    assert "Contact Number: not collected" in body
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







def test_cg34_corrections_invalidate_old_values_and_flag_animal_emergency():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: I want to recall the date that not work them.
Assistant: I'm sorry to hear that. Is the gate in Wirral or Sefton?
Caller: ¿Puedo?
Assistant: Thanks. And do you happen to know the gate number?
Caller: 368
Assistant: Thanks, I've got that. Can you tell me what the problem is with the gate?
Caller: die Box doch gerne.
Assistant: Could you please tell me your full name?
Caller: Ja, am Schukal 1
Assistant: Thanks. And can you give me your full address, including postcode?
Caller: Brisbane Avenue, Walsee CHO59JX
Assistant: Thank you. Lastly, could you provide your contact number?
Caller: 2755726746
Assistant: The gate is in Wirral, gate number 8111, with a lock fault. Your name is Andrew Carlin, and your contact number is 07755 222 6746. Is all of that correct?
Caller: You've got my details wrong.
Assistant: What needs correcting?
Caller: Is a dog stuck in the gate?
Assistant: Right, so the problem is a dog stuck in the gate. Is everything else correct?
Caller: They call my name wrong.
Assistant: Could you tell me your correct name?
Caller: Andrew Cartwright
Assistant: Your name is Andrew Cartwright. Is all of that correct now?
Caller: I got the number one. You got my name wrong. You got the telephone number wrong.
Assistant: What's the correct gate number?
Caller: boboan
Assistant: What's the correct name?
Caller: interest rate
Assistant: What's the correct telephone number?
Caller: 277
Caller: five treble two six seven four six
Assistant: The gate is gate number 1 and your contact number is 07755 222 6746. Is all of that correct now?
Caller: I think you got the telephone number wrong.
Assistant: Could you repeat the correct telephone number?
"""
    details = extract_call_details(transcript, job_reference="CG-000034")
    subject, body = build_internal_email(details)

    assert subject == "[REPAIR] Gate not collected - CG-000034"
    assert "Gate Number: not collected" in body
    assert "Resident Name: not collected" in body
    assert "Contact Number: not collected" in body
    assert "Area: not collected" in body
    assert "Fault Details: a dog stuck in the gate" in body
    assert "Urgency: emergency - animal trapped" in body
    head = body.split("FULL TRANSCRIPT", 1)[0]
    assert "07755 222 6746" not in head
    assert "2755726746" not in head

def test_cg41_confirmed_readback_recovers_dropped_leading_zero_phone():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: We need to pull the alligator up here.
Assistant: Okay, and is the gate in Wirral or Sefton?
Caller: Boom.
Assistant: Thanks. Now, could you give me the gate number, please?
Caller: 829
Assistant: Thank you. And what's wrong with the gate?
Caller: just for fun stock short
Assistant: Right. Now, can I have your full name, please?
Caller: David Jones
Assistant: Thanks, David. And what's your full address, please, including postcode?
Caller: 22 May Avenue, Wirral, CH45 9JW
Assistant: Thank you. And finally, what's your contact telephone number, please?
Caller: 1512308476
Assistant: Thanks. Let me just read back those details. You've reported a problem with the alley gate at 22 May Avenue in Wirral, gate number 829, that it's stuck shut. Your name is David Jones, and your full address is 22 May Avenue, Wirral, CH45 9JW, and your contact number is 01512308476. Your job reference is CG-000041. Is all that information correct, or is there anything else I can help you with?
Caller: Yes, that is correct.
"""
    details = extract_call_details(transcript, job_reference="CG-000041")
    subject, body = build_internal_email(details)
    assert details["callback_number"] == "01512308476"
    assert subject == "[REPAIR] Gate 829 - CG-000041"
    assert "Contact Number: 01512308476" in body

def test_cg42_scoped_area_correction_preserves_final_voice_readback():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: I might not be able to get to my way, I think.
Assistant: I see. Is that gate in Wirral or Sefton?
Caller: Ja.
Assistant: And could you please tell me the gate number?
Caller: 骑 车 。
Assistant: Thank you. What's wrong with the gate, please?
Caller: stock short
Assistant: Right. And what's your full name, please?
Caller: Change my
Assistant: Thanks. Could you give me your full address, including postcode, please?
Caller: 15 Colchester Road
Assistant: And what's your callback telephone
Caller: Get the ones.
Assistant: Thank you. And what's your contact telephone number?
Caller: 224XY
Assistant: Thanks. And what's your contact telephone number, please?
Caller: 112308476
Assistant: Thanks. So, just to confirm, the gate is in Wirral, gate number 122, and it's stuck shut. Your name's James May, your address is 15 Colchester Road, PR22 4XY, and your contact number is 01123 08476. Your job reference is CG-000042. Someone will be able to look at it within 24 to 48 hours. Is there anything else?
Caller: und sanften
Assistant: Ah, my mistake, thank you. In Sefton, then. Is that correct now?
Caller: Yes.
Assistant: Right. Anything else I can help you with?
Caller: chat
Assistant: Thank you for calling Chapel Gate. Goodbye, have a nice day.
"""
    details = extract_call_details(transcript, job_reference="CG-000042")
    subject, body = build_internal_email(details)

    assert details["gate_number"] == "122"
    assert details["caller_name"] == "James May"
    assert details["callback_number"] == "01123 08476"
    assert details["caller_address"] == "15 Colchester Road"
    assert details["postcode"] == "PR22 4XY"
    assert details["area"] == "Sefton"
    assert details["fault_or_request"] == "stuck shut"
    assert subject == "[REPAIR] Gate 122 - CG-000042"
    assert "Resident Name: James May" in body
    assert "Contact Number: 01123 08476" in body
    assert "Address: 15 Colchester Road" in body
    assert "Postcode: PR22 4XY" in body
    assert "Area: Sefton" in body
    assert "Fault Details: stuck shut" in body

def test_common_lock_and_key_fault_wording_classifies_as_repair():
    assert classify_call_category("Caller: locks broken") == CATEGORY_REPAIR
    assert classify_call_category("Caller: my key won't fit the lock") == CATEGORY_REPAIR


def test_email_renders_network_caller_callback_and_number_called():
    details = {
        "category": CATEGORY_REPAIR,
        "job_reference": "CG-000043",
        "caller_name": "Test Caller",
        "caller_number": "+447700900123",
        "callback_number": "01512308476",
        "called_number": "+441512345678",
        "caller_address": "1 Test Road",
        "postcode": "CH45 9AA",
        "area": "Wirral",
        "gate_number": "123",
        "fault_or_request": "stuck shut",
        "transcript": "Caller: test",
    }
    _, body = build_internal_email(details)
    assert "Caller Number: +447700900123 (network caller ID; not identity-verified)" in body
    assert "Contact Number: 01512308476 (spoken callback)" in body
    assert "Number Called: +441512345678 (Chapelgate line)" in body
    assert "Network caller number differs from the spoken callback number." in body


def test_call_numbers_lookup_fails_closed_without_credentials(monkeypatch):
    monkeypatch.delenv("TWILIO_ACCOUNT_SID", raising=False)
    monkeypatch.delenv("TWILIO_AUTH_TOKEN", raising=False)
    assert call_notifications.call_numbers_for_call_sid("CA-test") == {
        "caller_number": "",
        "called_number": "",
    }


def test_call_numbers_lookup_returns_caller_ani_and_destination(monkeypatch):
    monkeypatch.setenv("TWILIO_ACCOUNT_SID", "AC-test")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "token-test")

    class FakeCall:
        from_ = "+447700900123"
        to = "+442922716489"

    monkeypatch.setattr(
        call_notifications,
        "_fetch_twilio_call",
        lambda _sid, _account, _token: FakeCall(),
    )

    assert call_notifications.call_numbers_for_call_sid("CA-test") == {
        "caller_number": "+447700900123",
        "called_number": "+442922716489",
    }


def test_report_quality_treats_equivalent_phone_formatting_as_same_number():
    warnings = call_notifications.report_quality_warnings(
        {
            "category": CATEGORY_KEY,
            "caller_number": "+44 7700 900123",
            "callback_number": "07700900123",
        }
    )
    assert "Network caller number differs from the spoken callback number." not in warnings


def test_report_quality_withheld_ani_never_suggests_callback_use():
    warnings = call_notifications.report_quality_warnings(
        {
            "category": CATEGORY_KEY,
            "caller_number": "withheld",
            "callback_number": "",
        }
    )
    assert "Network caller number was withheld." in warnings
    assert "No reliable callback number was collected." in warnings
    assert not any("use the network caller number" in item for item in warnings)


def test_repair_email_job_card_does_not_duplicate_operational_fields():
    details = {
        "category": CATEGORY_REPAIR,
        "job_reference": "CG-000099",
        "caller_name": "Jane Smith",
        "caller_number": "+447700900111",
        "callback_number": "07700900111",
        "called_number": "+442922716489",
        "caller_address": "9 Example Road",
        "postcode": "CH45 1AA",
        "area": "Wirral",
        "gate_number": "99",
        "fault_or_request": "lock broken",
        "transcript": "Caller: the lock is broken",
    }
    _, body = build_internal_email(details)
    assert body.count("Resident Name: Jane Smith") == 1
    assert body.count("Contact Number: 07700900111") == 1
    assert body.count("Address: 9 Example Road") == 1
    assert body.count("Postcode: CH45 1AA") == 1
    assert body.count("Area: Wirral") == 1
    assert body.count("Gate Number: 99") == 1
    assert "FULL TRANSCRIPT - AUDIT ONLY" in body
    assert "Raw machine transcription may contain recognition errors" in body


def test_report_quality_uses_network_number_when_callback_not_collected():
    warnings = call_notifications.report_quality_warnings(
        {
            "category": CATEGORY_REPAIR,
            "caller_number": "+447700900123",
            "callback_number": "",
            "caller_name": "Test Caller",
            "caller_address": "1 Test Road",
            "area": "Wirral",
            "gate_number": "123",
            "fault_or_request": "lock broken",
        }
    )
    assert any("Spoken callback number was not reliably collected" in item for item in warnings)
    assert not any("Network caller number was unavailable" in item for item in warnings)


def test_plural_lock_fault_prefers_caller_wording_over_wrong_assistant_area():
    transcript = """Assistant: Hi, thank you for calling Chapel Gate. How can we help you today?
Caller: I need to report a gate repair.
Assistant: Is the gate in Wirral or Sefton?
Caller: Wirral.
Assistant: What is the gate number?
Caller: 428
Assistant: What is wrong with the gate?
Caller: locks broken
Assistant: Thanks. Your gate number is 428, your name is Test Caller, your address is 1 Test Road, and your contact number is 01512308476. The job reference is CG-000044. Just to confirm, you're reporting a broken lock on gate number 428 in Sefton. Is all of that correct?
Caller: Yes.
"""
    details = extract_call_details(transcript, job_reference="CG-000044")
    assert details["area"] == "Wirral"
    assert details["fault_or_request"].casefold() == "locks broken"


def test_assistant_words_do_not_classify_a_call():
    transcript = """Assistant: Is this about a repair, a key order, or a master key?
Caller: No, sorry, wrong number.
Assistant: No problem. Goodbye.
"""
    assert classify_call_category(transcript) is None


def test_unconfirmed_assistant_fault_is_never_promoted_to_structured_fault():
    transcript = """Assistant: Thank you for calling Chapel Gate.
Caller: I need help with my gate.
Assistant: Is the lock broken?
Caller: I don't know.
Assistant: So that is a broken lock on gate 428 in Sefton.
Caller: No, I didn't say that.
"""
    details = extract_call_details(transcript, job_reference="CG-000201")
    assert details["fault_or_request"] == ""
    assert details["category"] is None


def test_assistant_key_script_does_not_add_key_section_to_repair_email():
    transcript = """Assistant: Thank you for calling Chapel Gate.
Caller: The lock is broken on gate 428.
Assistant: If you need keys, orders are placed online at alleygates.co.uk and keys are sent by Royal Mail.
Caller: My name is Test Caller.
"""
    details = extract_call_details(transcript, job_reference="CG-000202")
    details.update({
        "caller_number": "+447700900202",
        "called_number": "+442922716489",
        "callback_number": "07700900202",
        "caller_address": "1 Test Road",
        "postcode": "CH45 9AA",
        "area": "Wirral",
        "gate_number": "428",
        "category": CATEGORY_REPAIR,
    })
    _, body = build_internal_email(details)
    assert "Chapelgate Alleygate Repair Call Report" in body
    assert "KEY ORDER / ENQUIRY" not in body


def test_manual_review_required_when_callback_is_missing_even_with_network_caller_id():
    details = {
        "category": CATEGORY_REPAIR,
        "job_reference": "CG-000203",
        "caller_name": "Test Caller",
        "caller_number": "+447700900203",
        "callback_number": "",
        "called_number": "+442922716489",
        "caller_address": "1 Test Road",
        "postcode": "CH45 9AA",
        "area": "Wirral",
        "gate_number": "203",
        "fault_or_request": "lock broken",
        "transcript": "Caller: lock broken",
    }
    assert call_notifications.report_requires_review(details) is True
    _, body = build_internal_email(details)
    assert "Manual Review Required: YES" in body


def test_manual_review_not_required_for_complete_matching_repair_intake():
    details = {
        "category": CATEGORY_REPAIR,
        "job_reference": "CG-000204",
        "caller_name": "Test Caller",
        "caller_number": "+447700900204",
        "callback_number": "07700900204",
        "called_number": "+442922716489",
        "caller_address": "1 Test Road",
        "postcode": "CH45 9AA",
        "area": "Wirral",
        "gate_number": "204",
        "fault_or_request": "lock broken",
        "transcript": "Caller: lock broken",
    }
    assert call_notifications.report_requires_review(details) is False


def test_manual_review_required_when_network_and_spoken_numbers_disagree():
    details = {
        "category": CATEGORY_KEY,
        "caller_number": "+447700900205",
        "callback_number": "07700900999",
    }
    assert call_notifications.report_requires_review(details) is True

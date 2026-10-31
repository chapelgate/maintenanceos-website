from datetime import datetime, timezone, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from action_evidence import record_action_result
from models import (
    Approval, Appointment, AuditEvent, Base, CallEvent, CallSession, CallSessionTenant, Client, Contractor, ContractorAcceptance,
    Property, Resident, ResidentConfirmation, WorkOrder,
)
from voice_policy import detect_action_claims, detect_private_disclosure, validate_assistant_text, verified_actions_for_work_order


@pytest.fixture
def action_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as session:
        client = Client(name="Synthetic action-claim tenant")
        session.add(client);session.flush()
        prop = Property(client_id=client.id, address="Synthetic address", postcode="ZZ1 1ZZ")
        session.add(prop);session.flush()
        resident = Resident(
            client_id=client.id,
            property_id=prop.id,
            name="Synthetic Resident",
            phone="+447700900099",
            email="action-claim@example.test",
        )
        contractor = Contractor(
            client_id=client.id, name="Synthetic contractor", trade="Plumber",
            qualification_summary="SYNTHETIC", qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31", active=True,
        )
        session.add_all([resident, contractor]);session.flush()
        work_order = WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            resident_id=resident.id,
            assigned_contractor_id=contractor.id,
            description="Synthetic repair",
        )
        session.add(work_order);session.commit()
        yield session, work_order, contractor
    engine.dispose()


@pytest.mark.parametrize(
    "text,expected",
    [
        ("We have contacted a contractor.", "contractor_contacted"),
        ("I dispatched a plumber.", "contractor_dispatched"),
        ("Emergency services have been notified.", "emergency_services_contacted"),
        ("A human operator has been contacted.", "human_operator_contacted"),
        ("We have notified the landlord.", "other_party_notified"),
        ("Your appointment has been booked.", "appointment_booked"),
        ("I have transferred you to a human operator.", "human_transfer_connected"),
        ("Your repair has been completed.", "repair_completed"),
        ("Your appointment has been cancelled.", "appointment_cancelled"),
        ("I've arranged an engineer.", "contractor_dispatched"),
        ("The electrician is coming.", "contractor_dispatched"),
        ("I have called for an ambulance.", "emergency_services_contacted"),
        ("We passed this to the landlord.", "other_party_notified"),
        ("The property manager knows about the issue.", "other_party_notified"),
    ],
)
def test_false_action_claims_are_rejected(text, expected):
    allowed, reason = validate_assistant_text(text, critical_active=False)
    assert not allowed
    assert reason == f"unverified_action_confirmation:{expected}"


def test_chained_false_action_claims_are_all_detected_and_blocked():
    text="I dispatched a plumber and called 999, then notified the landlord."
    claims=detect_action_claims(text)
    assert claims=={"contractor_dispatched","emergency_services_contacted","other_party_notified"}
    allowed,reason=validate_assistant_text(text,critical_active=False)
    assert not allowed
    assert reason=="unverified_action_confirmation:contractor_dispatched,emergency_services_contacted,other_party_notified"


@pytest.mark.parametrize(
    "text",
    [
        "I can contact a contractor after approval.",
        "I will ask a human operator to contact you.",
        "Please call 999 now if there is immediate danger.",
        "I cannot confirm that emergency services have been contacted.",
        "I cannot confirm that your appointment has been booked.",
        "A contractor may be contacted after review.",
        "Has the contractor been contacted?",
        "There is no evidence that the repair has been completed.",
        "The transfer is still pending.",
    ],
)
def test_advice_future_intent_and_explicit_uncertainty_are_not_success_claims(text):
    assert detect_action_claims(text) == set()
    assert validate_assistant_text(text, critical_active=False) == (True, "")


def test_pre_work_order_action_evidence_requires_tenant_bound_call(action_session):
    session,work_order,_contractor=action_session
    call=CallSession(call_sid="CA-action-evidence",caller="sha256:synthetic")
    session.add(call);session.flush()
    session.add(CallSessionTenant(call_session_id=call.id,client_id=work_order.client_id));session.flush()
    record_action_result(
        session,client_id=work_order.client_id,work_order_id=None,call_session_id=call.id,
        action_type="human_transfer_connected",action_key="synthetic-transfer",
        status="SUCCEEDED",actor="Synthetic callback",provider_reference="synthetic-reference",
    )
    session.flush()
    assert session.query(CallEvent).filter_by(
        call_session_id=call.id,client_id=work_order.client_id,event="ACTION_RESULT_RECORDED"
    ).count()==1
    assert session.query(AuditEvent).filter_by(work_order_id=None,event="ACTION_RESULT_RECORDED").count()==0
    other=Client(name="Other action tenant");session.add(other);session.flush()
    with pytest.raises(ValueError,match="call tenant"):
        record_action_result(
            session,client_id=other.id,work_order_id=None,call_session_id=call.id,
            action_type="human_transfer_connected",action_key="cross-tenant-transfer",
            status="SUCCEEDED",actor="Synthetic callback",provider_reference="synthetic-reference",
        )


def test_action_evidence_without_work_order_or_call_is_rejected(action_session):
    session,work_order,_contractor=action_session
    with pytest.raises(ValueError,match="tenant-bound"):
        record_action_result(
            session,client_id=work_order.client_id,work_order_id=None,
            action_type="human_transfer_connected",action_key="orphan-transfer",
            status="SUCCEEDED",actor="Synthetic callback",provider_reference="synthetic-reference",
        )
def test_pending_approved_or_failed_dispatch_is_not_verified(action_session):
    session, work_order, _ = action_session
    for status in ("PENDING", "APPROVED", "REJECTED"):
        session.add(Approval(
            client_id=work_order.client_id,
            work_order_id=work_order.id,
            approval_type="DISPATCH",
            proposed_action="Synthetic dispatch",
            reason="Synthetic test",
            status=status,
        ))
    session.commit()
    assert verified_actions_for_work_order(session, work_order.id) == set()
    allowed, reason = validate_assistant_text(
        "We have dispatched an engineer.",
        critical_active=False,
        verified_actions=verified_actions_for_work_order(session, work_order.id),
    )
    assert not allowed
    assert reason == "unverified_action_confirmation:contractor_dispatched"


def test_committed_contractor_acceptance_allows_matching_confirmation(action_session):
    session, work_order, contractor = action_session
    session.add(ContractorAcceptance(
        work_order_id=work_order.id,
        contractor_id=contractor.id,
        action_key="synthetic-acceptance",
    ))
    session.commit()
    verified = verified_actions_for_work_order(session, work_order.id)
    assert verified == {"contractor_contacted"}
    assert validate_assistant_text(
        "We have contacted a contractor.",
        critical_active=False,
        verified_actions=verified,
    ) == (True, "")
    assert validate_assistant_text(
        "An engineer is on the way.", critical_active=False, verified_actions=verified
    ) == (False, "unverified_action_confirmation:contractor_dispatched")


def test_committed_booked_appointment_allows_matching_confirmation(action_session):
    session, work_order, contractor = action_session
    start = datetime.now(timezone.utc) + timedelta(days=1)
    session.add(Appointment(
        work_order_id=work_order.id,
        contractor_id=contractor.id,
        start_at=start,
        end_at=start + timedelta(hours=1),
        status="BOOKED",
    ))
    session.add(AuditEvent(
        work_order_id=work_order.id,
        actor="Scheduler",
        event="APPOINTMENT_BOOKED",
        detail="synthetic slot",
    ))
    session.commit()
    verified = verified_actions_for_work_order(session, work_order.id)
    assert "appointment_booked" in verified
    assert validate_assistant_text(
        "Your appointment has been booked.",
        critical_active=False,
        verified_actions=verified,
    ) == (True, "")


@pytest.mark.parametrize("status", ["REQUESTED", "PENDING", "ATTEMPTED", "FAILED", "CANCELLED", "UNKNOWN"])
def test_unconfirmed_action_result_states_never_authorise_success_claim(action_session, status):
    session, work_order, _ = action_session
    record_action_result(
        session, client_id=work_order.client_id, work_order_id=work_order.id,
        action_type="emergency_services_contacted", action_key=f"emergency-{status}",
        status=status, actor="Synthetic test",
    )
    session.commit()
    assert "emergency_services_contacted" not in verified_actions_for_work_order(session, work_order.id)
    assert validate_assistant_text(
        "Emergency services have been notified.", critical_active=False,
        verified_actions=verified_actions_for_work_order(session, work_order.id),
    )[0] is False


@pytest.mark.parametrize("action,text", [
    ("contractor_dispatched", "An engineer is on the way."),
    ("emergency_services_contacted", "Emergency services have been notified."),
    ("human_operator_contacted", "A human operator has been contacted."),
    ("human_transfer_connected", "I have transferred you to a human operator."),
    ("other_party_notified", "We have notified the landlord."),
    ("appointment_cancelled", "Your appointment has been cancelled."),
])
def test_only_succeeded_action_result_authorises_matching_claim(action_session, action, text):
    session, work_order, _ = action_session
    record_action_result(
        session, client_id=work_order.client_id, work_order_id=work_order.id,
        action_type=action, action_key=f"success-{action}", status="SUCCEEDED",
        actor="Synthetic verified callback", provider_reference="synthetic-provider-reference",
    )
    session.commit()
    assert validate_assistant_text(
        text, critical_active=False,
        verified_actions=verified_actions_for_work_order(session, work_order.id),
    ) == (True, "")


def test_latest_failed_result_overrides_earlier_success(action_session):
    session, work_order, _ = action_session
    for key, status in (("attempt-one", "SUCCEEDED"), ("attempt-two", "FAILED")):
        record_action_result(
            session, client_id=work_order.client_id, work_order_id=work_order.id,
            action_type="contractor_dispatched", action_key=key, status=status,
            actor="Synthetic callback",
        )
        session.commit()
    assert "contractor_dispatched" not in verified_actions_for_work_order(session, work_order.id)


def test_contradictory_result_for_same_idempotency_key_is_rejected(action_session):
    session, work_order, _ = action_session
    record_action_result(
        session, client_id=work_order.client_id, work_order_id=work_order.id,
        action_type="human_operator_contacted", action_key="same-result", status="FAILED",
        actor="Synthetic callback",
    )
    session.commit()
    with pytest.raises(ValueError, match="Contradictory action result"):
        record_action_result(
            session, client_id=work_order.client_id, work_order_id=work_order.id,
            action_type="human_operator_contacted", action_key="same-result", status="SUCCEEDED",
            actor="Synthetic callback",
        )


def test_resident_resolution_is_required_for_completed_repair_claim(action_session):
    session, work_order, _ = action_session
    assert validate_assistant_text(
        "Your repair has been completed.", critical_active=False,
        verified_actions=verified_actions_for_work_order(session, work_order.id),
    )[0] is False
    session.add(ResidentConfirmation(work_order_id=work_order.id, resolved=True, comment="Synthetic confirmation"))
    session.commit()
    assert validate_assistant_text(
        "Your repair has been completed.", critical_active=False,
        verified_actions=verified_actions_for_work_order(session, work_order.id),
    ) == (True, "")


def test_private_disclosure_requires_verified_identity():
    markers = ["4 Synthetic Test Way", "ZZ1 1ZZ", "SYNTHETIC ACCESS CODE"]
    for text in (
        "Your address is 4 Synthetic Test Way.",
        "The property access code is SYNTHETIC ACCESS CODE.",
        "Our records show your repair history.",
    ):
        assert detect_private_disclosure(text, markers)
        assert validate_assistant_text(
            text, critical_active=False, identity_verified=False, private_markers=markers
        ) == (False, "unverified_private_disclosure")
        assert validate_assistant_text(
            text, critical_active=False, identity_verified=True, private_markers=markers
        ) == (True, "")

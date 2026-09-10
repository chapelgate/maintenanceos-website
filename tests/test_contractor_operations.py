from datetime import datetime,timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import operations
import worker
from models import (
    Approval,Appointment,AuditEvent,AutomationJob,Base,Client,Contractor,ContractorAttempt,
    Property,Resident,User,WorkOrder,
)
from tenant_security import TenantAccessError


@pytest.fixture
def contractor_db(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    factory=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    monkeypatch.setattr(operations,"SessionLocal",factory);monkeypatch.setattr(worker,"SessionLocal",factory)
    with factory() as session:
        client=Client(name="Synthetic contractor tenant");session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Synthetic",postcode="SW1A 1AA");session.add(prop);session.flush()
        resident=Resident(client_id=client.id,property_id=prop.id,name="Resident A",phone="1",email="a@example.test")
        other_resident=Resident(client_id=client.id,property_id=prop.id,name="Resident B",phone="2",email="b@example.test")
        first=Contractor(
            client_id=client.id,name="First plumber",trade="Plumber",postcode_coverage="SW1A",
            qualification_summary="SYNTHETIC",qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",active=True,rating=5,
        )
        second=Contractor(
            client_id=client.id,name="Second plumber",trade="Plumber",postcode_coverage="SW1A",
            qualification_summary="SYNTHETIC",qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",active=True,rating=4,
        )
        manager=User(client_id=client.id,email="manager-contractor@example.test",password_hash="x",role="manager",active=True)
        session.add_all([resident,other_resident,first,second,manager]);session.commit()
        ids={"client":client.id,"property":prop.id,"resident":resident.id,"other_resident":other_resident.id,
             "first":first.id,"second":second.id,"manager":manager.id}
    yield factory,ids
    engine.dispose()


def _work_order(factory,ids,status="READY_FOR_DISPATCH",assigned=None):
    with factory() as session:
        work_order=WorkOrder(
            client_id=ids["client"],property_id=ids["property"],resident_id=ids["resident"],
            description="Tap leak",category="Plumbing",trade="Plumber",urgency="P3",
            status=status,ai_confidence=.9,assigned_contractor_id=assigned,
        )
        session.add(work_order);session.commit();return work_order.id


def test_out_of_area_contractor_is_never_selected(contractor_db):
    factory,ids=contractor_db
    with factory() as session:
        session.get(Contractor,ids["first"]).postcode_coverage="M1"
        session.get(Contractor,ids["second"]).active=False
        session.commit()
    work_order_id=_work_order(factory,ids)
    assert operations.select_contractor(work_order_id) is None
    with factory() as session:
        session.get(Contractor,ids["second"]).active=True;session.commit()
    assert operations.select_contractor(work_order_id)==ids["second"]


def test_declined_contractor_is_not_selected_again(contractor_db):
    factory,ids=contractor_db
    work_order_id=_work_order(factory,ids,"AWAITING_CONTRACTOR",ids["first"])
    assert operations.decline_contractor(work_order_id,ids["first"],"decline-one")
    assert operations.select_contractor(work_order_id)==ids["second"]
    with factory() as session:
        attempt=session.query(ContractorAttempt).filter_by(work_order_id=work_order_id,contractor_id=ids["first"]).one()
        assert attempt.status=="DECLINED" and attempt.responded_at is not None


def test_timed_out_contractor_requires_human_release_and_is_not_reselected(contractor_db):
    factory,ids=contractor_db
    work_order_id=_work_order(factory,ids,"AWAITING_CONTRACTOR",ids["first"])
    with factory() as session:
        job=AutomationJob(
            work_order_id=work_order_id,job_type="CONTRACTOR_RESPONSE_CHECK",
            run_at=datetime.utcnow()-timedelta(minutes=1),payload="{}",
        );session.add(job);session.commit()
    worker.run_due_jobs()
    with factory() as session:
        work_order=session.get(WorkOrder,work_order_id)
        approval=session.query(Approval).filter_by(work_order_id=work_order_id,approval_type="CONTRACTOR_TIMEOUT").one()
        assert work_order.status=="HUMAN_REVIEW"
        assert session.query(ContractorAttempt).filter_by(
            work_order_id=work_order_id,contractor_id=ids["first"],status="TIMED_OUT"
        ).count()==1
        approval_id=approval.id
    assert operations.approve_operational_action(
        approval_id,ids["manager"],"Supervisor approved selection of a fallback contractor"
    )
    assert operations.select_contractor(work_order_id)==ids["second"]


def test_resident_appointment_confirmation_is_scoped_and_idempotent(contractor_db):
    factory,ids=contractor_db
    work_order_id=_work_order(factory,ids,"APPOINTMENT_BOOKED",ids["first"])
    with factory() as session:
        appointment=Appointment(
            work_order_id=work_order_id,contractor_id=ids["first"],
            start_at=datetime.utcnow()+timedelta(days=1),status="BOOKED",
        );session.add(appointment);session.commit();appointment_id=appointment.id
    with pytest.raises(TenantAccessError):
        operations.confirm_appointment(work_order_id,999,"bad-resident")
    with pytest.raises(TenantAccessError):
        operations.confirm_appointment(work_order_id,ids["other_resident"],"other-resident")
    assert operations.confirm_appointment(work_order_id,ids["resident"],"resident-confirm-1")
    assert operations.confirm_appointment(work_order_id,ids["resident"],"resident-confirm-1")
    with factory() as session:
        assert session.get(Appointment,appointment_id).resident_confirmed
        assert session.query(AuditEvent).filter_by(
            work_order_id=work_order_id,event="APPOINTMENT_CONFIRMED"
        ).count()==1

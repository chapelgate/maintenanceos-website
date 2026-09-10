from datetime import timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import reporting
from clock import utcnow
from models import Approval,AuditEvent,AutomationJob,Base,Client,Escalation,Property,WorkOrder


def test_operational_metrics_are_tenant_scoped_and_timestamp_derived(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    factory=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    monkeypatch.setattr(reporting,"SessionLocal",factory)
    start=utcnow()-timedelta(minutes=60)
    with factory() as session:
        tenant=Client(name="Metrics tenant");other=Client(name="Other tenant");session.add_all([tenant,other]);session.flush()
        prop=Property(client_id=tenant.id,address="Synthetic",postcode="ZZ1 1ZZ")
        other_prop=Property(client_id=other.id,address="Other",postcode="YY1 1YY");session.add_all([prop,other_prop]);session.flush()
        work_order=WorkOrder(
            client_id=tenant.id,property_id=prop.id,description="Tap",status="HUMAN_REVIEW",
            urgency="P1",repeat_repair=True,created_at=start,
        )
        other_work_order=WorkOrder(
            client_id=other.id,property_id=other_prop.id,description="Other",status="CLOSED",
            urgency="P3",created_at=start,closed_at=utcnow(),
        )
        session.add_all([work_order,other_work_order]);session.flush()
        session.add_all([
            AuditEvent(work_order_id=work_order.id,actor="Decision Engine",event="INTAKE_CLASSIFIED",created_at=start+timedelta(minutes=5)),
            AuditEvent(work_order_id=work_order.id,actor="Contractor",event="CONTRACTOR_ACCEPT",created_at=start+timedelta(minutes=15)),
            Approval(client_id=tenant.id,work_order_id=work_order.id,approval_type="TRIAGE",proposed_action="Review",reason="Test",created_at=start+timedelta(minutes=5),decided_at=start+timedelta(minutes=10),status="APPROVED"),
            AutomationJob(work_order_id=work_order.id,job_type="TEST",run_at=start,status="FAILED"),
            Escalation(work_order_id=work_order.id,level="RED",reason="Synthetic",status="OPEN"),
        ]);session.commit();tenant_id=tenant.id
    metrics=reporting.operational_metrics(tenant_id)
    assert metrics["requests"]==1 and metrics["urgency_distribution"]=={"P1":1,"P2":0,"P3":0}
    assert metrics["avg_minutes_to_triage"]==5 and metrics["avg_minutes_to_contractor_acceptance"]==15
    assert metrics["avg_approval_turnaround_minutes"]==5
    assert metrics["automation_failed"]==1 and metrics["safety_escalations"]==1
    assert metrics["repeat_repairs"]==1 and metrics["human_intervention_rate"]==1
    assert metrics["human_minutes_per_work_order"] is None
    assert not metrics["human_minutes_measurement_available"]

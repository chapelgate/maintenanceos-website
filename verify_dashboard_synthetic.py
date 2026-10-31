import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
import reporting
from idempotency import set_ai_side_effects
from models import (
    Approval,
    AutomationJob,
    Base,
    Client,
    CommunicationDelivery,
    Contractor,
    CriticalSafetyState,
    Escalation,
    Property,
    Resident,
    TenantBoundary,
    User,
    WorkOrder,
)
from readiness import report as readiness_report
from reporting import operational_metrics
from safety_controls import clear_critical_safety, critical_safety_active
from security import hash_password


def build_database(path: Path):
    engine = create_engine(f"sqlite:///{path}", connect_args={"check_same_thread": False})
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    models.SessionLocal = factory
    reporting.SessionLocal = factory
    with factory() as session:
        client = Client(name="Synthetic dashboard tenant")
        session.add(client)
        session.flush()
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="dashboard"))
        user = User(client_id=client.id, email="dashboard-admin@example.test", password_hash=hash_password("SyntheticPass123!"), role="admin", active=True)
        prop = Property(client_id=client.id, address="1 Synthetic Dashboard Way", postcode="SW1A 1AA")
        session.add_all([user, prop])
        session.flush()
        resident = Resident(client_id=client.id, property_id=prop.id, name="Synthetic Resident", phone="+440000000001", email="dashboard@example.test")
        contractor = Contractor(
            client_id=client.id,
            name="Synthetic Contractor",
            trade="Plumber",
            postcode_coverage="SW1A",
            qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",
            active=True,
        )
        session.add_all([resident, contractor])
        session.flush()
        routine = WorkOrder(client_id=client.id, property_id=prop.id, resident_id=resident.id, assigned_contractor_id=contractor.id, description="Tap leaking", category="Plumbing", trade="Plumber", urgency="P3", status="READY_FOR_DISPATCH", ai_confidence=.9)
        critical = WorkOrder(client_id=client.id, property_id=prop.id, resident_id=resident.id, assigned_contractor_id=contractor.id, description="I smell gas", category="Heating", trade="Heating Engineer", urgency="P1", status="HUMAN_REVIEW", ai_confidence=.9, safety_flags='[{"code":"GAS_SMELL","level":"RED"}]')
        session.add_all([routine, critical])
        session.flush()
        session.add(CriticalSafetyState(work_order_id=critical.id, client_id=client.id, active=True, flags=critical.safety_flags, established_by="synthetic dashboard verifier"))
        session.add(Approval(client_id=client.id, work_order_id=routine.id, approval_type="DISPATCH", proposed_action="Dispatch", reason="Synthetic"))
        session.add(Escalation(work_order_id=critical.id, level="RED", reason=critical.safety_flags, status="OPEN"))
        session.add(AutomationJob(work_order_id=routine.id, job_type="SYNTHETIC_FAILED_JOB", run_at=datetime.now(timezone.utc), status="FAILED", attempts=3))
        session.add(CommunicationDelivery(client_id=client.id, work_order_id=routine.id, communication_id=1, channel="EMAIL", action_key="synthetic-failed", status="FAILED"))
        set_ai_side_effects(session, False, actor="synthetic verifier", reason="local closed dashboard verification")
        session.commit()
        return factory, {"client_id": client.id, "user_id": user.id, "routine_id": routine.id, "critical_id": critical.id}


def verify(path: Path) -> dict:
    os.environ.setdefault("ENABLE_REALTIME_VOICE", "false")
    os.environ.setdefault("ENABLE_PUBLIC_PROVIDER_INGRESS", "false")
    factory, ids = build_database(path)
    with factory() as session:
        client_id = ids["client_id"]
        command_centre = {
            "open_jobs": session.query(WorkOrder).filter(WorkOrder.client_id == client_id, WorkOrder.status.notin_(["CLOSED", "CANCELLED"])).count(),
            "pending_approvals": session.query(Approval).filter_by(client_id=client_id, status="PENDING").count(),
            "red_escalations": session.query(Escalation).join(WorkOrder, Escalation.work_order_id == WorkOrder.id).filter(WorkOrder.client_id == client_id, Escalation.status == "OPEN", Escalation.level == "RED").count(),
        }
        system_health = readiness_report()
        failed_jobs = session.query(AutomationJob).join(WorkOrder, AutomationJob.work_order_id == WorkOrder.id).filter(WorkOrder.client_id == client_id, AutomationJob.status == "FAILED").count()
        failed_comms = session.query(CommunicationDelivery).filter_by(client_id=client_id, status="FAILED").count()
        critical_active = critical_safety_active(session, ids["critical_id"])
        blocked_clearance = False
        try:
            clear_critical_safety(session, ids["critical_id"], actor_user_id=ids["user_id"], reason="no", client_id=client_id)
        except Exception:
            blocked_clearance = True
            session.rollback()
        metrics = operational_metrics(client_id)
    checks = {
        "synthetic_database_created": path.exists(),
        "command_centre_counts_visible": command_centre == {"open_jobs": 2, "pending_approvals": 1, "red_escalations": 1},
        "critical_latch_visible": critical_active,
        "system_health_report_available": isinstance(system_health, dict) and "ready" in system_health,
        "failed_job_and_communication_counts_visible": failed_jobs == 1 and failed_comms == 1,
        "supervisor_action_validation_blocks_weak_clearance": blocked_clearance,
        "operational_metrics_returned": isinstance(metrics, dict) and metrics.get("requests") == 2,
        "external_calls_permitted": False,
        "realtime_voice_enabled": False,
    }
    return {"generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), "database": str(path), "checks": checks, "passed": all(checks.values())}


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify dashboard backing queries and supervisor controls against synthetic data.")
    parser.add_argument("--database", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = verify(args.database)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    print("Dashboard synthetic verification:", "PASS" if result["passed"] else "FAIL")
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

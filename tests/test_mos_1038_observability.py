import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

import api
import reporting
from models import Base, Client, Property, WorkOrder, AuditEvent, Approval, AutomationJob, Escalation, TenantBoundary
from clock import utcnow
from datetime import timedelta


@pytest.fixture
def test_database(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api, reporting):
        monkeypatch.setattr(module, "SessionLocal", testing_session)
    return testing_session


def configure_internal_api(monkeypatch, session_factory):
    token = "i" * 32
    with session_factory() as session:
        client = Client(name="Synthetic HTTP tenant")
        session.add(client)
        session.flush()
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="HTTP"))
        session.commit()
        client_id = client.id
    monkeypatch.setenv("INTERNAL_API_TOKEN", token)
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID", str(client_id))
    monkeypatch.setenv("VOICE_TENANT_MODE", "isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", str(client_id))
    return client_id, {"Authorization": f"Bearer {token}"}


def seed_metrics(session_factory, client_id):
    start = utcnow() - timedelta(minutes=60)
    with session_factory() as session:
        prop = Property(client_id=client_id, address="Synthetic", postcode="ZZ1 1ZZ")
        session.add(prop)
        session.flush()
        work_order = WorkOrder(
            client_id=client_id,
            property_id=prop.id,
            description="Tap",
            status="HUMAN_REVIEW",
            urgency="P1",
            repeat_repair=True,
            created_at=start,
        )
        session.add(work_order)
        session.flush()
        session.add_all([
            AuditEvent(work_order_id=work_order.id, actor="Decision Engine", event="INTAKE_CLASSIFIED", created_at=start + timedelta(minutes=5)),
            AuditEvent(work_order_id=work_order.id, actor="Contractor", event="CONTRACTOR_ACCEPT", created_at=start + timedelta(minutes=15)),
            Approval(client_id=client_id, work_order_id=work_order.id, approval_type="TRIAGE", proposed_action="Review", reason="Test", created_at=start + timedelta(minutes=5), decided_at=start + timedelta(minutes=10), status="APPROVED"),
            AutomationJob(work_order_id=work_order.id, job_type="TEST", run_at=start, status="FAILED"),
            Escalation(work_order_id=work_order.id, level="RED", reason="Synthetic", status="OPEN"),
        ])
        session.commit()


def test_operational_metrics_returns_dict(monkeypatch, test_database):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("TWILIO_AUTH_TOKEN", raising=False)

    client_id, headers = configure_internal_api(monkeypatch, test_database)
    seed_metrics(test_database, client_id)

    with patch("operational_logging.operational_event") as mock_log:
        mock_log.return_value = None
        with TestClient(api.app) as client:
            resp = client.get("/metrics", headers=headers)
            assert resp.status_code == 200
            data = resp.json()
            assert isinstance(data, dict)
            expected_keys = {
                "requests", "urgency_distribution",
                "avg_minutes_to_triage", "avg_minutes_to_contractor_acceptance",
                "avg_minutes_to_appointment", "avg_minutes_to_completion_submission",
                "overdue_open_jobs", "repeat_repairs",
                "human_intervention_rate", "human_minutes_per_work_order",
                "human_minutes_measurement_available", "automation_completed",
                "automation_failed", "safety_escalations",
                "open_escalations", "avg_approval_turnaround_minutes",
                "unresolved_exceptions", "data_scope",
                "correlation_id",
            }
            assert set(data.keys()) == expected_keys


def test_metrics_no_external_target(monkeypatch, test_database):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("TWILIO_AUTH_TOKEN", raising=False)

    client_id, headers = configure_internal_api(monkeypatch, test_database)
    seed_metrics(test_database, client_id)

    with TestClient(api.app) as client:
        resp = client.get("/metrics", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, dict)
        assert "data_scope" in data
        assert data["data_scope"] == "tenant_recorded_data"


def test_metrics_uses_local_data_scope(monkeypatch, test_database):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("TWILIO_AUTH_TOKEN", raising=False)

    client_id, headers = configure_internal_api(monkeypatch, test_database)
    seed_metrics(test_database, client_id)

    with TestClient(api.app) as client:
        resp = client.get("/metrics", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("data_scope") == "tenant_recorded_data"


def test_metrics_requires_internal_api(monkeypatch, test_database):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("TWILIO_AUTH_TOKEN", raising=False)

    with TestClient(api.app) as client:
        # Without internal API key
        resp = client.get("/metrics")
        assert resp.status_code == 401 or resp.status_code == 403 or resp.status_code == 503

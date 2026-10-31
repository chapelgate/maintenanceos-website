from datetime import datetime, timezone, timedelta

from fastapi.testclient import TestClient

import api
from models import Base, Client, Property, SessionLocal, WorkOrder, engine
from reporting import process_local_tenant_health


def _seed():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as s:
        s.query(WorkOrder).delete()
        s.query(Property).delete()
        s.query(Client).delete()
        client = Client(name="Synthetic Health Tenant", quote_approval_limit=250, invoice_variance_percent=10)
        s.add(client)
        s.flush()
        prop = Property(client_id=client.id, address="1 Test Street", postcode="CH45 1AA")
        s.add(prop)
        s.flush()
        now = datetime.now(timezone.utc)
        open_job = WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            description="synthetic open",
            urgency="P1",
            status="OPEN",
            created_at=now - timedelta(hours=5),
            repeat_repair=True,
        )
        closed_job = WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            description="synthetic closed",
            urgency="P3",
            status="CLOSED",
            created_at=now - timedelta(hours=10),
            closed_at=now - timedelta(hours=2),
        )
        s.add_all([open_job, closed_job])
        s.commit()
        return client.id


def test_process_local_tenant_health_counts_seeded_jobs():
    _seed()
    health = process_local_tenant_health()
    assert health["data_scope"] == "process-local"
    assert health["open_jobs"] >= 1
    assert health["closed_jobs"] >= 1
    assert health["p1_jobs"] >= 1
    assert health["repeat_repairs"] >= 1
    assert isinstance(health["avg_close_hours"], float)
    assert health["avg_close_hours"] > 0


def test_health_endpoint_uses_process_local_counts():
    _seed()
    body = TestClient(api.app).get("/health").json()
    tenant_health = body["tenant_health"]
    assert set(tenant_health) == set(api.TENANT_HEALTH_KEYS)
    assert tenant_health["data_scope"] == "process-local"
    assert tenant_health["open_jobs"] >= 1
    assert tenant_health["closed_jobs"] >= 1


def test_process_local_tenant_health_fail_closed_on_db_error(monkeypatch):
    def boom():
        raise RuntimeError("db down")

    monkeypatch.setattr("reporting.SessionLocal", boom)
    health = process_local_tenant_health()
    assert health == {
        "open_jobs": 0,
        "closed_jobs": 0,
        "p1_jobs": 0,
        "repeat_repairs": 0,
        "open_sla_breaches": 0,
        "avg_close_hours": 0.0,
        "human_intervention_rate": 0.0,
        "unresolved_exceptions": 0,
        "data_scope": "process-local",
    }

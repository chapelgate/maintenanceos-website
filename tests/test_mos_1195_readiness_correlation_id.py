from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import api
import readiness
from models import Base, Client, TenantBoundary


def _configure(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(api, "SessionLocal", testing_session)
    token = "i" * 32
    with testing_session() as session:
        client = Client(name="Synthetic readiness corr tenant")
        session.add(client)
        session.flush()
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="HTTP"))
        session.commit()
        client_id = client.id
    monkeypatch.setenv("INTERNAL_API_TOKEN", token)
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID", str(client_id))
    monkeypatch.setenv("VOICE_TENANT_MODE", "isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", str(client_id))
    return {"Authorization": f"Bearer {token}"}


def test_readiness_body_includes_correlation_id(monkeypatch):
    headers = _configure(monkeypatch)
    with TestClient(api.app) as client:
        resp = client.get("/readiness", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "correlation_id" in data
        rid = resp.headers.get("x-request-id") or resp.headers.get("x-correlation-id")
        assert rid
        assert data["correlation_id"] == rid
        assert "commercial_release_ready" in data
        assert data["commercial_release_ready"] is False


def test_readiness_report_module_stays_boolean_only():
    report = readiness.report()
    assert "correlation_id" not in report
    assert report["commercial_release_ready"] is False

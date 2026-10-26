"""Synthetic England landlord vertical: on, cap, compliance, handoff, off."""

from __future__ import annotations

import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
from models import AuditEvent, Base, Property, Resident
from pilot.landlord_vertical import (
    VerticalComplianceError,
    VerticalPropertyCap,
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    evaluate_landlord_compliance,
    get_maintenance_handoff,
    open_synthetic_portfolio,
    record_maintenance_handoff,
    reset_landlord_vertical_for_tests,
)
from pilot.runtime_guard import pilot_status, reset_pilot_runtime_for_tests


@pytest.fixture(autouse=True)
def _isolated_pilot(monkeypatch, tmp_path):
    os.environ.pop("PILOT_MODE_ARMED", None)
    os.environ.pop("WORKSMART_VERTICAL", None)
    monkeypatch.setenv("PILOT_BOOTSTRAP_CALLS", "0")
    monkeypatch.setenv("PILOT_STATE_PATH", str(tmp_path / "pilot_state.json"))
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(models, "SessionLocal", factory)
    monkeypatch.setattr("pilot.runtime_guard.SessionLocal", factory)
    reset_pilot_runtime_for_tests()
    reset_landlord_vertical_for_tests()
    yield factory
    reset_landlord_vertical_for_tests()
    reset_pilot_runtime_for_tests()
    os.environ.pop("PILOT_MODE_ARMED", None)
    os.environ.pop("WORKSMART_VERTICAL", None)


def test_synthetic_england_landlord_vertical_e2e(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    observed = pilot_status()["worksmart_vertical"]
    assert observed["vertical"] == "landlordos", "product status reads WORKSMART_VERTICAL"
    assert observed["active"] is False
    assert observed["landlordos_pin"] == "UNKNOWN"
    assert observed["mos_sha"]
    assert observed["market_scope"] == "england_synthetic_le_10"

    activated = activate_landlord_vertical()
    assert activated["active"] is True
    assert pilot_status()["worksmart_vertical"]["active"] is True

    with pytest.raises(VerticalPropertyCap) as over_cap:
        open_synthetic_portfolio(units=11)
    assert over_cap.value.requested == 11
    assert over_cap.value.limit == 10
    with models.SessionLocal() as session:
        assert session.query(Property).count() == 0

    opened = open_synthetic_portfolio(units=10)
    with models.SessionLocal() as session:
        stored = session.query(Property).filter_by(client_id=opened["client_id"]).count()
    assert stored == 10
    assert opened["property_count"] == stored
    assert stored <= 10

    with pytest.raises(VerticalPropertyCap) as eleventh:
        open_synthetic_portfolio(units=1)
    assert eleventh.value.requested == 11
    with models.SessionLocal() as session:
        assert session.query(Property).filter_by(client_id=opened["client_id"]).count() == 10

    report = evaluate_landlord_compliance(opened["client_id"])
    assert report["passed"] is True, "compliance evaluator accepts the synthetic portfolio"
    assert report["property_count"] == 10
    assert report["findings"] == []

    recorded = record_maintenance_handoff(
        opened["client_id"],
        description="SYNTHETIC maintenance handoff",
    )
    assert recorded["ref"]
    assert recorded["synthetic"] is True
    loaded = get_maintenance_handoff(recorded["ref"])
    assert loaded is not None, "handoff ref is persisted"
    assert loaded["ref"] == recorded["ref"]
    assert loaded["work_order_id"] == recorded["work_order_id"]

    off = deactivate_landlord_vertical()
    assert os.environ["WORKSMART_VERTICAL"] == "none"
    assert off["vertical"] == "none"
    assert off["active"] is False
    assert pilot_status()["worksmart_vertical"]["vertical"] == "none"
    assert pilot_status()["calls_completed"] == 0
    assert pilot_status()["armed"] is False


def test_compliance_counts_stored_rows_and_rejects_live_email(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    activate_landlord_vertical()
    opened = open_synthetic_portfolio(units=1)
    with models.SessionLocal() as session:
        extra = Property(
            client_id=opened["client_id"],
            address="SYNTHETIC LANDLORD PROPERTY 2 - NO REAL ADDRESS",
            postcode="ZZ1 1ZZ",
            property_type="TEST ONLY",
            access_notes="TEST DATA ONLY",
            emergency_notes="TEST DATA ONLY",
        )
        session.add(extra)
        resident = session.query(Resident).filter_by(client_id=opened["client_id"]).one()
        resident.email = "live-person@example.com"
        session.commit()
        stored = session.query(Property).filter_by(client_id=opened["client_id"]).count()
    report = evaluate_landlord_compliance(opened["client_id"])
    assert stored == 2
    assert report["property_count"] == stored
    assert report["passed"] is False
    assert any(item.startswith("resident_email_not_synthetic") for item in report["findings"])


def test_handoff_is_not_recorded_when_compliance_fails(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    activate_landlord_vertical()
    opened = open_synthetic_portfolio(units=1)
    with models.SessionLocal() as session:
        resident = session.query(Resident).filter_by(client_id=opened["client_id"]).one()
        resident.email = "live-person@example.com"
        session.commit()
    with pytest.raises(VerticalComplianceError) as denied:
        record_maintenance_handoff(
            opened["client_id"],
            description="SYNTHETIC maintenance handoff",
        )
    assert any(item.startswith("resident_email_not_synthetic") for item in denied.value.findings)
    assert get_maintenance_handoff("SYN-HO-1") is None
    with models.SessionLocal() as session:
        assert session.query(AuditEvent).filter_by(event="maintenance_handoff").count() == 0

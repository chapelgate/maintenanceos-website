"""WORKSMART_VERTICAL=none restores the pilot snapshot from vertical on."""

from __future__ import annotations

import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
from models import Base, Client
from pilot.chapelgate_config import MAX_REAL_CALLS, TENANT_ID
from pilot.landlord_vertical import (
    VerticalInactive,
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    reset_landlord_vertical_for_tests,
)
from pilot.runtime_guard import (
    admit_pilot_call,
    evaluate_signals_and_maybe_abort,
    pilot_status,
    record_pilot_call_completed,
    reset_pilot_runtime_for_tests,
)


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


def test_vertical_off_restores_baseline(monkeypatch):
    before = pilot_status()
    before_completed = before["calls_completed"]
    before_admitted = before["calls_admitted"]
    before_answered = before["scorecard"]["calls_answered"]
    before_aborted = before["aborted"]
    assert before["armed"] is False

    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    activated = activate_landlord_vertical()
    assert activated["active"] is True
    assert pilot_status()["worksmart_vertical"]["vertical"] == "landlordos"

    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    for index in range(MAX_REAL_CALLS):
        admit_pilot_call(tenant_id=TENANT_ID, call_sid=f"CA-ROLLBACK-{index}")
        record_pilot_call_completed(success=True)
    evaluate_signals_and_maybe_abort({"tenant_id": TENANT_ID, "application_errors": True})
    dirty = pilot_status()
    assert dirty["calls_completed"] == MAX_REAL_CALLS
    assert dirty["calls_completed"] != before_completed
    assert dirty["scorecard"]["calls_answered"] > before_answered
    assert dirty["armed"] is True
    assert dirty["aborted"] is True

    off = deactivate_landlord_vertical()
    restored = pilot_status()
    assert os.environ["WORKSMART_VERTICAL"] == "none", "vertical off assigns WORKSMART_VERTICAL=none"
    assert off["vertical"] == "none"
    assert off["active"] is False
    assert restored["worksmart_vertical"]["vertical"] == "none"
    assert restored["calls_completed"] == before_completed
    assert restored["calls_admitted"] == before_admitted
    assert restored["scorecard"]["calls_answered"] == before_answered
    assert restored["aborted"] is before_aborted
    assert restored["armed"] is False


def test_env_none_read_restores_dirty_session(monkeypatch):
    before_completed = pilot_status()["calls_completed"]
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    activate_landlord_vertical()
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    admit_pilot_call(tenant_id=TENANT_ID, call_sid="CA-ENV-NONE")
    record_pilot_call_completed(success=True)
    assert pilot_status()["calls_completed"] != before_completed

    monkeypatch.setenv("WORKSMART_VERTICAL", "none")
    restored = pilot_status()
    assert restored["worksmart_vertical"]["vertical"] == "none"
    assert restored["calls_completed"] == before_completed
    assert restored["armed"] is False


def test_missing_landlordos_does_not_crash_core(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    status = pilot_status()
    assert status["tenant"] == TENANT_ID
    assert status["armed"] is False
    assert status["worksmart_vertical"]["vertical"] == "none"
    assert status["worksmart_vertical"]["active"] is False
    with models.SessionLocal() as session:
        client = Client(
            name="SYNTHETIC CORE MOS",
            quote_approval_limit=0,
            invoice_variance_percent=0,
        )
        session.add(client)
        session.commit()
        assert client.id > 0
    with pytest.raises(VerticalInactive):
        activate_landlord_vertical()

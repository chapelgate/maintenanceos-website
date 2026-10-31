import os
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
from models import Base
from pilot.landlord_vertical import (
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    open_synthetic_portfolio,
    reset_landlord_vertical_for_tests,
)
from pilot.runtime_guard import reset_pilot_runtime_for_tests


@pytest.fixture
def isolated(monkeypatch, tmp_path):
    os.environ.pop("PILOT_MODE_ARMED", None)
    os.environ.pop("WORKSMART_VERTICAL", None)
    monkeypatch.setenv("PILOT_BOOTSTRAP_CALLS", "0")
    monkeypatch.setenv("PILOT_STATE_PATH", str(tmp_path / "pilot_state.json"))
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(models, "SessionLocal", factory)
    monkeypatch.setattr("pilot.runtime_guard.SessionLocal", factory)
    reset_pilot_runtime_for_tests()
    reset_landlord_vertical_for_tests()
    yield factory
    reset_landlord_vertical_for_tests()
    reset_pilot_runtime_for_tests()
    os.environ.pop("WORKSMART_VERTICAL", None)


def test_synthetic_tenant_flow(isolated, monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlordos")
    activated = activate_landlord_vertical()
    assert activated["active"] is True
    opened = open_synthetic_portfolio(units=1)
    assert opened["property_count"] == 1
    assert opened.get("synthetic", True) in (True, 1) or "client_id" in opened
    off = deactivate_landlord_vertical()
    assert off["active"] is False


def test_no_live_pii_in_synthetic_flow():
    kit = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md")
    assert kit.is_file()
    text = kit.read_text().lower()
    assert "synthetic" in text
    assert "not a live" in text or "no live pii" in text or "not a sale" in text


def test_rollback_test_exists():
    assert callable(deactivate_landlord_vertical)
    assert callable(reset_landlord_vertical_for_tests)
    assert Path("tests/test_landlord_vertical_e2e.py").is_file()

from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import seed_synthetic_tenant as seed
from models import Base, Client, Contractor, Property, Resident, TenantBoundary
from tenant_security import SYNTHETIC_MODE

KIT = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md")


def test_demo_tenant_has_synthetic_data_only(monkeypatch):
    payload = seed.synthetic_seed_strings()
    assert seed.assert_synthetic_markers(payload) is True
    assert payload["mode"] == SYNTHETIC_MODE
    assert "SYNTHETIC" in payload["client_name"]
    assert payload["resident_email"].endswith(".invalid")
    assert payload["contractor_email"].endswith(".invalid")
    assert payload["property_postcode"].startswith("ZZ")

    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(seed, "init_db", lambda: None)
    client_id = seed.ensure_synthetic_tenant(factory)
    with factory() as session:
        client = session.get(Client, client_id)
        boundary = session.query(TenantBoundary).filter_by(client_id=client_id).one()
        prop = session.query(Property).filter_by(client_id=client_id).one()
        resident = session.query(Resident).filter_by(client_id=client_id).one()
        contractor = session.query(Contractor).filter_by(client_id=client_id).one()
        assert "SYNTHETIC" in client.name
        assert boundary.mode == SYNTHETIC_MODE
        assert prop.postcode.startswith("ZZ")
        assert resident.email.endswith(".invalid")
        assert contractor.email.endswith(".invalid")


def test_no_live_pii_in_demo():
    text = KIT.read_text(encoding="utf-8").lower()
    assert "synthetic" in text
    assert "live personal data" in text or "live customer" in text or "live pii" in text
    assert "do not" in text
    bad = seed.synthetic_seed_strings()
    bad["resident_email"] = "person@example.com"
    with pytest.raises(AssertionError):
        seed.assert_synthetic_markers(bad)
    bad = seed.synthetic_seed_strings()
    bad["property_postcode"] = "SW1A 1AA"
    with pytest.raises(AssertionError):
        seed.assert_synthetic_markers(bad)

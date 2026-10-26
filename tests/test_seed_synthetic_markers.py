import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import seed_synthetic_tenant as seed
from models import Base, Client, Contractor, Property, Resident, TenantBoundary
from tenant_security import SYNTHETIC_MODE


def test_synthetic_seed_strings_carry_required_markers():
    payload = seed.synthetic_seed_strings()
    assert seed.assert_synthetic_markers(payload) is True
    assert payload["mode"] == SYNTHETIC_MODE
    assert "SYNTHETIC" in payload["client_name"]
    assert payload["resident_email"].endswith(".invalid")
    assert payload["contractor_email"].endswith(".invalid")
    assert payload["property_postcode"].startswith("ZZ")


def test_assert_synthetic_markers_rejects_live_looking_payload():
    bad = seed.synthetic_seed_strings()
    bad["resident_email"] = "person@example.com"
    with pytest.raises(AssertionError, match=r"\.invalid"):
        seed.assert_synthetic_markers(bad)


def test_ensure_synthetic_tenant_persists_markers(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(seed, "init_db", lambda: None)
    client_id = seed.ensure_synthetic_tenant(session_factory)
    with session_factory() as session:
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
        assert contractor.active is False
        again = seed.ensure_synthetic_tenant(session_factory)
        assert again == client_id

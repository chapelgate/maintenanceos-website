"""Acceptance tests for mos-1026-03-pilot-guards (England private pilot caps).

Synthetic fixtures only. Uses an in-memory SQLite database and patches the
module-bound SessionLocal so no production DB or deploy config is touched.
"""

from __future__ import annotations

import sys

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import landlord_pilot_guards as guards
from models import Base, Client, Property


@pytest.fixture
def test_database(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)

    models_module = sys.modules["models"]
    monkeypatch.setattr(models_module, "SessionLocal", testing_session)
    monkeypatch.setattr(guards, "SessionLocal", testing_session)
    return testing_session


def _seed_client_and_props(session_factory, count=0):
    with session_factory() as session:
        client = Client(name="Synthetic landlord client")
        session.add(client)
        session.flush()
        for i in range(count):
            session.add(
                Property(
                    client_id=client.id,
                    address=f"Synthetic property {i}",
                    postcode=f"ZZ{i:03d} 1ZZ",
                    property_type="TEST ONLY",
                )
            )
        session.commit()
        return client.id


def test_eleventh_property_fails_closed(monkeypatch, test_database):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")
    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "synthetic")

    client_id = _seed_client_and_props(test_database, count=10)
    assert guards.landlord_property_count(client_id) == 10
    assert guards.can_create_landlord_property(client_id) is False
    assert guards.can_list_landlord_properties(client_id) is True


def test_landlord_vertical_requires_non_social_scope(monkeypatch, test_database):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "synthetic")

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    assert guards.landlord_market_scope_ok() is False
    assert guards.is_landlord_pilot_ready() is False

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "unknown")
    assert guards.landlord_market_scope_ok() is False
    assert guards.is_landlord_pilot_ready() is False

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")
    assert guards.landlord_market_scope_ok() is True
    assert guards.is_landlord_pilot_ready() is True


def test_live_pii_mode_keeps_readiness_false(monkeypatch, test_database):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")

    monkeypatch.delenv("LANDLORD_PILOT_DATA_MODE", raising=False)
    assert guards.landlord_pilot_data_mode_ok() is False
    assert guards.is_landlord_pilot_ready() is False

    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "live-pii")
    assert guards.landlord_pilot_data_mode_ok() is False
    assert guards.is_landlord_pilot_ready() is False

    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "synthetic")
    assert guards.landlord_pilot_data_mode_ok() is True
    assert guards.is_landlord_pilot_ready() is True


def test_vertical_off_leaves_limits_unchanged(monkeypatch, test_database):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "synthetic")

    assert guards.is_landlord_vertical() is False
    assert guards.is_vertical_off() is True
    client_id = _seed_client_and_props(test_database, count=100)
    assert guards.can_create_landlord_property(client_id) is True
    assert guards.can_list_landlord_properties(client_id) is True
    assert guards.is_landlord_pilot_ready() is False

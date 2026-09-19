"""Red-team concurrency isolation: attempt cross-call / cross-tenant leakage."""

from __future__ import annotations

import threading

import pytest

import channels
import voice_bridge
from call_capacity import admit_call, capacity_snapshot, release_call_lease, reset_capacity_backend_for_tests
from concurrency_loadtest import run_level
from models import Base, CallSession, Client, Property, TenantBoundary
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tenant_security import call_client_id


@pytest.fixture(autouse=True)
def _reset(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    monkeypatch.setenv("PER_CLIENT_MAX_CONCURRENT_CALLS", "100")
    reset_capacity_backend_for_tests()
    yield
    reset_capacity_backend_for_tests()


def test_red_team_cannot_read_foreign_transcript_under_concurrency():
    report = run_level(25, hold_seconds=0.05)
    assert report.pass_gate
    assert report.cross_leak_detected is False
    # Every accepted call must map caller marker only to its own session.
    for detail in report.details:
        assert detail["isolation_ok"] is True
        assert detail["tenant_ok"] is True


def test_red_team_cross_tenant_session_binding_rejected_by_capacity_and_db(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'rt-tenant.db'}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    voice_bridge.SessionLocal = factory
    channels.SessionLocal = factory

    with factory() as session:
        a = Client(name="Tenant A")
        b = Client(name="Tenant B")
        session.add_all([a, b])
        session.flush()
        session.add_all(
            [
                Property(client_id=a.id, address="A Road", postcode="AA1 1AA"),
                Property(client_id=b.id, address="B Road", postcode="BB1 1BB"),
                TenantBoundary(client_id=a.id, mode="SYNTHETIC_TEST", label="A"),
                TenantBoundary(client_id=b.id, mode="SYNTHETIC_TEST", label="B"),
            ]
        )
        session.commit()
        client_a, client_b = a.id, b.id

    sid_a = voice_bridge.create_call_session("CA-RT-A", "+447700900001", client_a)
    sid_b = voice_bridge.create_call_session("CA-RT-B", "+447700900002", client_b)
    admit_call(call_sid="CA-RT-A", call_session_id=sid_a, client_id=client_a)
    admit_call(call_sid="CA-RT-B", call_session_id=sid_b, client_id=client_b)

    voice_bridge.record_transcript_segment(sid_a, "Caller", "Secret-from-A-ONLY")
    voice_bridge.record_transcript_segment(sid_b, "Caller", "Secret-from-B-ONLY")

    with factory() as session:
        ta = session.get(CallSession, sid_a)
        tb = session.get(CallSession, sid_b)
        assert "Secret-from-A-ONLY" in (ta.transcript or "")
        assert "Secret-from-B-ONLY" not in (ta.transcript or "")
        assert "Secret-from-B-ONLY" in (tb.transcript or "")
        assert "Secret-from-A-ONLY" not in (tb.transcript or "")
        assert call_client_id(session, sid_a) == client_a
        assert call_client_id(session, sid_b) == client_b

    release_call_lease(call_sid="CA-RT-A", call_session_id=sid_a)
    release_call_lease(call_sid="CA-RT-B", call_session_id=sid_b)
    assert capacity_snapshot().active_calls == 0
    engine.dispose()


def test_red_team_parallel_close_does_not_swap_tenants(tmp_path):
    """Hammer close_call_session from many threads; tenant bindings must hold."""
    db_path = tmp_path / "rt-close.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    voice_bridge.SessionLocal = factory
    channels.SessionLocal = factory

    with factory() as session:
        clients = []
        for i in range(8):
            c = Client(name=f"RT-close-{i}")
            session.add(c)
            session.flush()
            session.add(Property(client_id=c.id, address=f"{i} Close Rd", postcode="ZZ1 1ZZ"))
            session.add(TenantBoundary(client_id=c.id, mode="SYNTHETIC_TEST", label=f"c{i}"))
            clients.append(c.id)
        session.commit()

    session_ids = []
    for i, client_id in enumerate(clients):
        csid = voice_bridge.create_call_session(f"CA-CLOSE-{i}", f"+44770091{i:04d}", client_id)
        admit_call(call_sid=f"CA-CLOSE-{i}", call_session_id=csid, client_id=client_id)
        voice_bridge.record_transcript_segment(csid, "Caller", f"owner-marker-{client_id}")
        session_ids.append((csid, client_id))

    errors: list[str] = []

    def closer(pair):
        csid, client_id = pair
        try:
            voice_bridge.close_call_session(csid)
            with factory() as session:
                bound = call_client_id(session, csid)
                text = session.get(CallSession, csid).transcript or ""
                if bound != client_id:
                    errors.append(f"tenant_swap:{csid}:{bound}!={client_id}")
                if f"owner-marker-{client_id}" not in text:
                    errors.append(f"transcript_lost:{csid}")
                foreign = [cid for _, cid in session_ids if cid != client_id]
                if any(f"owner-marker-{cid}" in text for cid in foreign):
                    errors.append(f"cross_leak:{csid}")
        except Exception as exc:  # noqa: BLE001 — red-team capture
            errors.append(f"{type(exc).__name__}:{exc}")

    threads = [threading.Thread(target=closer, args=(pair,)) for pair in session_ids]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)
    assert not errors, errors
    assert capacity_snapshot().active_calls == 0
    engine.dispose()

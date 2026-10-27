import inspect

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import api
import channels
import decision_engine
import operations
import voice_bridge
import worker
from models import Base, User
from safety_controls import SafetyStateError
from tests.test_acceptance_local import seed_work_order


def test_close_work_order_does_not_swallow_safety_state_error():
    source = inspect.getsource(operations.close_work_order)
    assert "require_noncritical" in source
    assert "except SafetyStateError" not in source
    assert "_authorised_user" in source
    assert "LIFECYCLE_ROLES" in source


def test_close_work_order_raises_while_critical_safety_active(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api, channels, decision_engine, operations, voice_bridge, worker):
        monkeypatch.setattr(module, "SessionLocal", factory)
    client_id, _, _, _, work_order_id = seed_work_order(factory, "There is smoke filling the flat")
    with factory() as session:
        user = User(
            client_id=client_id,
            email="manager-at39@example.test",
            password_hash="x",
            role="manager",
            active=True,
        )
        session.add(user)
        session.commit()
        user_id = user.id
    with pytest.raises(SafetyStateError, match="Work-order closure is blocked"):
        operations.close_work_order(work_order_id, user_id)


def test_dashboard_close_path_catches_safety_state_error():
    source = open("dashboard.py", encoding="utf-8").read()
    close_idx = source.index('st.button("Close work order")')
    chunk = source[close_idx: close_idx + 280]
    assert "except SafetyStateError" in chunk
    assert "close_work_order(w.id,user.id)" in chunk

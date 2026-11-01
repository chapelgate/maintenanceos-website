from unittest.mock import MagicMock

import pytest

import safety_controls as sc


def test_latch_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setattr(sc, "operational_event", capture)

    session = MagicMock()
    session.no_autoflush = MagicMock()
    session.no_autoflush.__enter__ = MagicMock(return_value=None)
    session.no_autoflush.__exit__ = MagicMock(return_value=False)
    session.get.return_value = None

    work_order = MagicMock()
    work_order.id = 7
    work_order.client_id = 3
    work_order.safety_flags = "[]"

    state = sc.latch_critical_safety(
        session,
        work_order,
        [{"code": "GAS_LEAK", "level": "RED"}],
        "ops-actor",
    )
    assert state is not None
    assert any(
        name == "critical_safety_latched"
        and fields.get("client_id") == 3
        and fields.get("outcome") == "latched"
        and fields.get("reason_code") == "critical_safety"
        for name, fields in events
    )
    assert all("reason" not in fields for _, fields in events)
    assert all("flags" not in fields for _, fields in events)


def test_clear_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setattr(sc, "operational_event", capture)

    user = MagicMock()
    user.id = 9
    user.active = True
    user.client_id = 3
    user.role = "safety_manager"

    work_order = MagicMock()
    work_order.id = 7
    work_order.client_id = 3
    work_order.safety_flags = '[{"code":"GAS_LEAK"}]'

    state = MagicMock()
    state.active = True
    state.flags = '[{"code":"GAS_LEAK"}]'
    state.version = 1

    session = MagicMock()
    session.no_autoflush = MagicMock()
    session.no_autoflush.__enter__ = MagicMock(return_value=None)
    session.no_autoflush.__exit__ = MagicMock(return_value=False)
    session.info = {}

    def _get(model, key):
        name = getattr(model, "__name__", str(model))
        if name == "User":
            return user
        if name == "WorkOrder":
            return work_order
        if name == "CriticalSafetyState":
            return state
        return None

    session.get.side_effect = _get
    session.query.return_value.filter_by.return_value.all.return_value = []

    sc.clear_critical_safety(
        session,
        7,
        actor_user_id=9,
        reason="Verified safe by human review",
        client_id=3,
    )
    assert any(
        name == "critical_safety_cleared"
        and fields.get("client_id") == 3
        and fields.get("outcome") == "cleared"
        and fields.get("reason_code") == "critical_safety"
        for name, fields in events
    )
    joined = " ".join(str(fields) for _, fields in events)
    assert "Verified safe" not in joined

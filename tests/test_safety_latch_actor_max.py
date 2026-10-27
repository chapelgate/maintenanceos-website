import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import safety_controls


def test_safety_latch_actor_max_is_100():
    assert safety_controls.SAFETY_LATCH_ACTOR_MAX == 100
    source = inspect.getsource(safety_controls.latch_critical_safety)
    assert "SAFETY_LATCH_ACTOR_MAX" in source


def test_latch_rejects_blank_actor():
    session = MagicMock()
    work_order = SimpleNamespace(id=1, client_id=1, safety_flags="[]", urgency="P3", status="NEW")
    with pytest.raises(safety_controls.SafetyStateError, match="Safety latch actor invalid"):
        safety_controls.latch_critical_safety(session, work_order, [{"code": "GAS"}], "   ")


def test_latch_rejects_overlong_actor():
    session = MagicMock()
    work_order = SimpleNamespace(id=1, client_id=1, safety_flags="[]", urgency="P3", status="NEW")
    with pytest.raises(safety_controls.SafetyStateError, match="Safety latch actor invalid"):
        safety_controls.latch_critical_safety(
            session,
            work_order,
            [{"code": "GAS"}],
            "a" * (safety_controls.SAFETY_LATCH_ACTOR_MAX + 1),
        )

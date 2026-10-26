import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_sweep_reason_max_is_1000():
    assert lifecycle_runtime.SWEEP_REASON_MAX == 1000
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "SWEEP_REASON_MAX" in source
    assert "sweep_reason_too_long" in source


def test_sweep_reason_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
        reason="r" * lifecycle_runtime.SWEEP_REASON_MAX,
    )
    assert request is not None
    assert job is not None
    assert session.add.call_count >= 2


def test_sweep_reason_rejects_overlong():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="sweep_reason_too_long"):
        lifecycle_runtime.queue_retention_sweep(
            session,
            client_id=1,
            run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
            actor="Synthetic",
            reason="r" * (lifecycle_runtime.SWEEP_REASON_MAX + 1),
        )
    session.add.assert_not_called()

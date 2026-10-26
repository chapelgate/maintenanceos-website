import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_queue_requires_non_empty_reason():
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "sweep_reason_required" in source
    assert 'reason = (reason or "").strip()' in source


def test_queue_accepts_stripped_reason():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
        reason="  Scheduled retention sweep  ",
    )
    assert request.reason == "Scheduled retention sweep"
    assert job is not None


def test_queue_rejects_whitespace_reason():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="sweep_reason_required"
    ):
        lifecycle_runtime.queue_retention_sweep(
            session,
            client_id=1,
            run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
            actor="Synthetic",
            reason="   ",
        )

import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_valid_request_statuses_known_set():
    assert lifecycle_runtime.VALID_REQUEST_STATUSES == frozenset({"PENDING", "COMPLETED"})
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "VALID_REQUEST_STATUSES" in source
    assert "invalid_request_status" in source
    exec_source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "lifecycle_request_not_pending" in exec_source


def test_queue_retention_sweep_writes_pending():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert request.status == "PENDING"
    assert request.status in lifecycle_runtime.VALID_REQUEST_STATUSES
    assert job is not None
    assert session.add.call_count >= 2


def test_execute_rejects_non_pending_status():
    session = MagicMock()

    def _get(model, key):
        if model is lifecycle_runtime.Client:
            return MagicMock()
        return MagicMock(client_id=1, request_type="RETENTION_SWEEP", status="COMPLETED")

    session.get.side_effect = _get
    job = MagicMock()
    job.payload = '{"client_id": 1, "request_id": 7}'
    job.id = 3
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_request_not_pending"):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )

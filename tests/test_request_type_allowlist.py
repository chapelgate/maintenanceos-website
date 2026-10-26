import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_valid_request_types_known_set():
    assert lifecycle_runtime.VALID_REQUEST_TYPES == frozenset({"RETENTION_SWEEP"})
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "VALID_REQUEST_TYPES" in source
    assert "invalid_request_type" in source
    exec_source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "VALID_REQUEST_TYPES" in exec_source


def test_queue_retention_sweep_writes_allowed_type():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert request.request_type == "RETENTION_SWEEP"
    assert request.request_type in lifecycle_runtime.VALID_REQUEST_TYPES
    assert job is not None
    assert session.add.call_count >= 2


def test_execute_rejects_unknown_request_type():
    session = MagicMock()

    def _get(model, key):
        if model is lifecycle_runtime.Client:
            return MagicMock()
        return MagicMock(client_id=1, request_type="NOT_A_REAL_TYPE", status="PENDING")

    session.get.side_effect = _get
    job = MagicMock()
    job.payload = '{"client_id": 1, "request_id": 7}'
    job.id = 3
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_request_not_found_for_tenant"):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )

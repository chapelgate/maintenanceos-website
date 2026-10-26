import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_valid_lifecycle_job_statuses_known_set():
    assert lifecycle_runtime.VALID_LIFECYCLE_JOB_STATUSES == frozenset(
        {"PENDING", "RUNNING", "COMPLETED", "FAILED"}
    )
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "VALID_LIFECYCLE_JOB_STATUSES" in source
    assert "invalid_lifecycle_job_status" in source


def test_queue_retention_sweep_writes_pending_status():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert job.status == "PENDING"
    assert job.status in lifecycle_runtime.VALID_LIFECYCLE_JOB_STATUSES
    assert request is not None
    assert session.add.call_count >= 2


def test_queue_rejects_unknown_lifecycle_job_status():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with patch.object(lifecycle_runtime, "VALID_LIFECYCLE_JOB_STATUSES", frozenset({"OTHER"})):
        with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="invalid_lifecycle_job_status"):
            lifecycle_runtime.queue_retention_sweep(
                session,
                client_id=1,
                run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
                actor="Synthetic",
            )
    session.add.assert_not_called()

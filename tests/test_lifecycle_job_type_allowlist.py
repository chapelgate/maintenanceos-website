import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_valid_lifecycle_job_types_known_set():
    assert lifecycle_runtime.VALID_LIFECYCLE_JOB_TYPES == frozenset({"DATA_LIFECYCLE_SWEEP"})
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "VALID_LIFECYCLE_JOB_TYPES" in source
    assert "invalid_lifecycle_job_type" in source


def test_queue_retention_sweep_writes_allowed_job_type():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert job.job_type == "DATA_LIFECYCLE_SWEEP"
    assert job.job_type in lifecycle_runtime.VALID_LIFECYCLE_JOB_TYPES
    assert request is not None
    assert session.add.call_count >= 2


def test_queue_rejects_unknown_lifecycle_job_type():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with patch.object(lifecycle_runtime, "VALID_LIFECYCLE_JOB_TYPES", frozenset({"OTHER"})):
        with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="invalid_lifecycle_job_type"):
            lifecycle_runtime.queue_retention_sweep(
                session,
                client_id=1,
                run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
                actor="Synthetic",
            )
    session.add.assert_not_called()

import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_lifecycle_job_payload_max_known():
    assert lifecycle_runtime.LIFECYCLE_JOB_PAYLOAD_MAX == 2000
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "LIFECYCLE_JOB_PAYLOAD_MAX" in source
    assert "lifecycle_job_payload_too_long" in source


def test_queue_retention_sweep_writes_bounded_payload():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert len(job.payload) <= lifecycle_runtime.LIFECYCLE_JOB_PAYLOAD_MAX
    assert request is not None
    assert session.add.call_count >= 2


def test_queue_rejects_oversized_lifecycle_job_payload():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with patch.object(lifecycle_runtime, "LIFECYCLE_JOB_PAYLOAD_MAX", 5):
        with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_job_payload_too_long"):
            lifecycle_runtime.queue_retention_sweep(
                session,
                client_id=1,
                run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
                actor="Synthetic",
            )
    assert session.add.call_count == 1

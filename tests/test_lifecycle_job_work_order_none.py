import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_lifecycle_job_work_order_id_is_none():
    assert lifecycle_runtime.LIFECYCLE_JOB_WORK_ORDER_ID is None
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "LIFECYCLE_JOB_WORK_ORDER_ID" in source
    assert "lifecycle_job_work_order_must_be_none" in source
    exec_source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "lifecycle_job_work_order_must_be_none" in exec_source


def test_queue_retention_sweep_writes_null_work_order():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert job.work_order_id is None
    assert job.work_order_id is lifecycle_runtime.LIFECYCLE_JOB_WORK_ORDER_ID
    assert request is not None
    assert session.add.call_count >= 2


def test_execute_rejects_bound_work_order():
    session = MagicMock()
    job = MagicMock()
    job.work_order_id = 42
    job.payload = "{}"
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_job_work_order_must_be_none"
    ):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )

import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_valid_lifecycle_job_types_known_set():
    assert lifecycle_runtime.VALID_LIFECYCLE_JOB_TYPES == frozenset({"DATA_LIFECYCLE_SWEEP"})
    source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "VALID_LIFECYCLE_JOB_TYPES" in source
    assert "invalid_lifecycle_job_type" in source


def test_execute_accepts_data_lifecycle_sweep():
    session = MagicMock()
    request = MagicMock()
    request.client_id = 1
    request.request_type = "RETENTION_SWEEP"
    request.id = 9
    request.status = "PENDING"

    def _get(model, key):
        if model is lifecycle_runtime.DataLifecycleRequest:
            return request
        return MagicMock()

    session.get.side_effect = _get
    job = MagicMock()
    job.job_type = "DATA_LIFECYCLE_SWEEP"
    job.payload = '{"client_id": 1, "request_id": 9}'
    job.id = 3
    with patch.object(lifecycle_runtime, "plan_client_retention", return_value=[]):
        with patch.object(lifecycle_runtime, "audit"):
            applied = lifecycle_runtime.execute_lifecycle_sweep(
                session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
            )
    assert applied == 0
    assert request.status == "COMPLETED"


def test_execute_rejects_unknown_job_type():
    session = MagicMock()
    job = MagicMock()
    job.job_type = "NOT_A_LIFECYCLE_JOB"
    job.payload = '{"client_id": 1, "request_id": 9}'
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="invalid_lifecycle_job_type"
    ):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )

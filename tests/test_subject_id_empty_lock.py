import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_retention_sweep_subject_id_is_empty():
    assert lifecycle_runtime.RETENTION_SWEEP_SUBJECT_ID == ""
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "RETENTION_SWEEP_SUBJECT_ID" in source
    assert "retention_sweep_subject_id_must_be_empty" in source
    exec_source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "RETENTION_SWEEP_SUBJECT_ID" in exec_source
    assert "retention_sweep_subject_id_must_be_empty" in exec_source


def test_queue_retention_sweep_writes_empty_subject_id():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    assert request.subject_id == ""
    assert request.subject_id == lifecycle_runtime.RETENTION_SWEEP_SUBJECT_ID
    assert job is not None


def test_execute_rejects_non_empty_subject_id():
    session = MagicMock()
    session.get.side_effect = lambda model, key: MagicMock(
        client_id=1, request_type="RETENTION_SWEEP", subject_id="resident:1"
    ) if model is lifecycle_runtime.DataLifecycleRequest else MagicMock()
    job = MagicMock()
    job.payload = '{"client_id": 1, "request_id": 9}'
    job.id = 3
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError,
        match="retention_sweep_subject_id_must_be_empty",
    ):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )

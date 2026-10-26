import inspect
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_valid_lifecycle_job_payload_keys_known_set():
    assert lifecycle_runtime.VALID_LIFECYCLE_JOB_PAYLOAD_KEYS == frozenset(
        {"client_id", "request_id"}
    )
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "VALID_LIFECYCLE_JOB_PAYLOAD_KEYS" in source
    assert "invalid_lifecycle_job_payload_keys" in source
    exec_source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "VALID_LIFECYCLE_JOB_PAYLOAD_KEYS" in exec_source
    assert "invalid_lifecycle_job_payload_keys" in exec_source


def test_queue_retention_sweep_writes_exact_payload_keys():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
    )
    payload = json.loads(job.payload)
    assert set(payload) == lifecycle_runtime.VALID_LIFECYCLE_JOB_PAYLOAD_KEYS
    assert payload["client_id"] == 1
    assert request is not None
    assert session.add.call_count >= 2


def test_execute_rejects_unknown_lifecycle_job_payload_keys():
    session = MagicMock()
    job = MagicMock()
    job.payload = json.dumps({"client_id": 1, "request_id": 2, "extra": True})
    job.id = 9
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="invalid_lifecycle_job_payload_keys"
    ):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )
    session.get.assert_not_called()

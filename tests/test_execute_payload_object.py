import inspect
import json
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_execute_requires_payload_object():
    source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "isinstance(payload, dict)" in source
    assert "invalid_lifecycle_job_payload" in source


def test_execute_rejects_payload_list():
    session = MagicMock()
    job = MagicMock()
    job.status = "RUNNING"
    job.payload = json.dumps([1, 2])
    job.id = 2
    with patch.object(lifecycle_runtime, "_require_client") as require:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError,
            match="invalid_lifecycle_job_payload",
        ):
            lifecycle_runtime.execute_lifecycle_sweep(session, job, MagicMock())
        require.assert_not_called()


def test_execute_rejects_payload_string():
    session = MagicMock()
    job = MagicMock()
    job.status = "RUNNING"
    job.payload = json.dumps("client_id")
    job.id = 2
    with patch.object(lifecycle_runtime, "_require_client") as require:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError,
            match="invalid_lifecycle_job_payload",
        ):
            lifecycle_runtime.execute_lifecycle_sweep(session, job, MagicMock())
        require.assert_not_called()

import inspect
import json
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_execute_requires_retention_type():
    source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "lifecycle_request_wrong_type" in source
    assert "RETENTION_SWEEP" in source


def test_execute_rejects_wrong_type():
    session = MagicMock()
    job = MagicMock()
    job.payload = json.dumps({"client_id": 1, "request_id": 99})
    job.id = 2
    request = MagicMock()
    request.id = 99
    request.client_id = 1
    request.request_type = "IMPORT"
    request.status = "PENDING"
    session.get.return_value = request
    with patch.object(lifecycle_runtime, "plan_client_retention") as plan:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError,
            match="lifecycle_request_wrong_type",
        ):
            lifecycle_runtime.execute_lifecycle_sweep(session, job, MagicMock())
        plan.assert_not_called()


def test_execute_accepts_retention_type():
    session = MagicMock()
    job = MagicMock()
    job.payload = json.dumps({"client_id": 1, "request_id": 99})
    job.id = 2
    request = MagicMock()
    request.id = 99
    request.client_id = 1
    request.request_type = "RETENTION_SWEEP"
    request.status = "PENDING"
    session.get.return_value = request
    with patch.object(lifecycle_runtime, "plan_client_retention", return_value=[]):
        with patch.object(lifecycle_runtime, "audit"):
            assert lifecycle_runtime.execute_lifecycle_sweep(session, job, MagicMock()) == 0

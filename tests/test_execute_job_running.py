import inspect
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_execute_requires_running_status():
    source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "lifecycle_job_not_running" in source
    assert '!= "RUNNING"' in source


def test_execute_rejects_pending_job():
    session = MagicMock()
    job = MagicMock(
        status="PENDING",
        payload=json.dumps({"client_id": 1, "request_id": 7}),
        id=3,
    )
    with patch.object(lifecycle_runtime, "plan_client_retention") as plan:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_job_not_running"
        ):
            lifecycle_runtime.execute_lifecycle_sweep(
                session, job, datetime.now(timezone.utc)
            )
        plan.assert_not_called()


def test_execute_rejects_completed_job():
    session = MagicMock()
    job = MagicMock(
        status="COMPLETED",
        payload=json.dumps({"client_id": 1, "request_id": 7}),
        id=3,
    )
    with patch.object(lifecycle_runtime, "plan_client_retention") as plan:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_job_not_running"
        ):
            lifecycle_runtime.execute_lifecycle_sweep(
                session, job, datetime.now(timezone.utc)
            )
        plan.assert_not_called()

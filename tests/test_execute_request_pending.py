import inspect
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_execute_requires_pending_status():
    source = inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    assert "lifecycle_request_not_pending" in source
    assert 'request.status != "PENDING"' in source


def test_execute_rejects_completed_request():
    session = MagicMock()
    client = MagicMock()
    request = MagicMock(
        client_id=1, request_type="RETENTION_SWEEP", status="COMPLETED", id=7
    )

    def _get(model, key):
        name = getattr(model, "__name__", str(model))
        if name == "Client":
            return client
        return request

    session.get.side_effect = _get
    job = MagicMock(id=3, payload=json.dumps({"client_id": 1, "request_id": 7}))
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_request_not_pending"
    ):
        lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )


def test_execute_accepts_pending_request():
    session = MagicMock()
    client = MagicMock()
    request = MagicMock(
        client_id=1, request_type="RETENTION_SWEEP", status="PENDING", id=7
    )

    def _get(model, key):
        name = getattr(model, "__name__", str(model))
        if name == "Client":
            return client
        return request

    session.get.side_effect = _get
    job = MagicMock(id=3, payload=json.dumps({"client_id": 1, "request_id": 7}))
    with patch.object(lifecycle_runtime, "plan_client_retention", return_value=()):
        applied = lifecycle_runtime.execute_lifecycle_sweep(
            session, job, datetime(2026, 10, 26, tzinfo=timezone.utc)
        )
    assert applied == 0
    assert request.status == "COMPLETED"

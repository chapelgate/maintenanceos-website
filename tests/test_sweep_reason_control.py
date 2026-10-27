import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_queue_retention_sweep_source_rejects_control_chars():
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "reason_has_control_chars" in source
    assert "sweep_control_chars" in source


def test_queue_retention_sweep_rejects_control_chars_in_reason():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="sweep_control_chars"):
        lifecycle_runtime.queue_retention_sweep(
            session,
            client_id=1,
            run_at=datetime(2026, 10, 27, tzinfo=timezone.utc),
            actor="Synthetic",
            reason="bad" + chr(0) + "sweep",
        )

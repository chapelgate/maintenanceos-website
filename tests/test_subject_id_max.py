import inspect
from datetime import datetime, timezone
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_subject_id_max_is_200():
    assert lifecycle_runtime.SUBJECT_ID_MAX == 200
    source = inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "SUBJECT_ID_MAX" in source
    assert "subject_id_too_long" in source


def test_subject_id_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock()
    request, job = lifecycle_runtime.queue_retention_sweep(
        session,
        client_id=1,
        run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
        actor="Synthetic",
        subject_id="s" * lifecycle_runtime.SUBJECT_ID_MAX,
    )
    assert request is not None
    assert job is not None
    assert request.subject_id == "s" * lifecycle_runtime.SUBJECT_ID_MAX
    assert session.add.call_count >= 2


def test_subject_id_rejects_overlong():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="subject_id_too_long"):
        lifecycle_runtime.queue_retention_sweep(
            session,
            client_id=1,
            run_at=datetime(2026, 10, 26, tzinfo=timezone.utc),
            actor="Synthetic",
            subject_id="s" * (lifecycle_runtime.SUBJECT_ID_MAX + 1),
        )
    session.add.assert_not_called()

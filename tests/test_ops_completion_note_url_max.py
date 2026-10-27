import inspect
from unittest.mock import patch

import api
import operations


def test_ops_completion_limits_match_api_caps():
    assert operations.COMPLETION_NOTE_MAX == api.COMPLETION_NOTE_MAX == 4000
    assert operations.EVIDENCE_URL_MAX == api.EVIDENCE_URL_MAX == 2000
    source = inspect.getsource(operations.submit_completion)
    assert "COMPLETION_NOTE_MAX" in source
    assert "EVIDENCE_URL_MAX" in source


def test_ops_completion_accepts_bounded_inputs():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded completion must open session")
        try:
            operations.submit_completion(
                1,
                1,
                "n" * operations.COMPLETION_NOTE_MAX,
                "u" * operations.EVIDENCE_URL_MAX,
                "ok-key",
            )
        except AssertionError as raised:
            assert "bounded completion" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded completion")


def test_ops_completion_rejects_blank_note_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for blank note")
        assert operations.submit_completion(1, 1, "   ", "", "ok-key") is None


def test_ops_completion_rejects_overlong_note_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong note")
        assert operations.submit_completion(
            1, 1, "n" * (operations.COMPLETION_NOTE_MAX + 1), "", "ok-key"
        ) is None


def test_ops_completion_rejects_overlong_url_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong evidence_url")
        assert operations.submit_completion(
            1, 1, "done", "u" * (operations.EVIDENCE_URL_MAX + 1), "ok-key"
        ) is None

import inspect
from unittest.mock import patch

import operations


def test_ops_quote_limits_match_api_caps():
    assert operations.AMOUNT_MAX == 1_000_000
    assert operations.QUOTE_DESCRIPTION_MAX == 4000
    source = inspect.getsource(operations.submit_quote)
    assert "AMOUNT_MAX" in source
    assert "QUOTE_DESCRIPTION_MAX" in source


def test_ops_quote_accepts_bounded_inputs():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded quote must open session")
        try:
            operations.submit_quote(1, 1, operations.AMOUNT_MAX, "d" * operations.QUOTE_DESCRIPTION_MAX)
        except AssertionError as raised:
            assert "bounded quote" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded quote")


def test_ops_quote_rejects_overlong_description_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong description")
        assert operations.submit_quote(1, 1, 10, "d" * (operations.QUOTE_DESCRIPTION_MAX + 1)) is None


def test_ops_quote_rejects_overlarge_amount_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlarge amount")
        assert operations.submit_quote(1, 1, operations.AMOUNT_MAX + 1, "ok") is None

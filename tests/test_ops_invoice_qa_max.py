import inspect
from unittest.mock import patch

import api
import operations


def test_ops_invoice_limits_match_api_caps():
    assert operations.AMOUNT_MAX == api.AMOUNT_MAX == 1_000_000
    assert operations.QUOTE_DESCRIPTION_MAX == api.QUOTE_DESCRIPTION_MAX == 4000
    assert operations.INVOICE_NUMBER_MAX == api.INVOICE_NUMBER_MAX == 100
    source = inspect.getsource(operations.invoice_qa)
    assert "AMOUNT_MAX" in source
    assert "QUOTE_DESCRIPTION_MAX" in source
    assert "INVOICE_NUMBER_MAX" in source


def test_ops_invoice_accepts_bounded_inputs():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded invoice must open session")
        try:
            operations.invoice_qa(
                1,
                1,
                "I" * operations.INVOICE_NUMBER_MAX,
                operations.AMOUNT_MAX,
                "d" * operations.QUOTE_DESCRIPTION_MAX,
            )
        except AssertionError as raised:
            assert "bounded invoice" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded invoice")


def test_ops_invoice_rejects_overlong_invoice_number_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong invoice_number")
        assert operations.invoice_qa(1, 1, "I" * (operations.INVOICE_NUMBER_MAX + 1), 10, "ok") is None


def test_ops_invoice_rejects_overlong_description_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong description")
        assert operations.invoice_qa(1, 1, "INV-1", 10, "d" * (operations.QUOTE_DESCRIPTION_MAX + 1)) is None


def test_ops_invoice_rejects_overlarge_amount_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlarge amount")
        assert operations.invoice_qa(1, 1, "INV-1", operations.AMOUNT_MAX + 1, "ok") is None

import inspect

import pytest
from fastapi import HTTPException

import api


def test_invoice_number_max_is_100():
    assert api.INVOICE_NUMBER_MAX == 100
    source = inspect.getsource(api.invoices)
    assert "INVOICE_NUMBER_MAX" in source


def test_invoice_number_accepts_bounded_text():
    assert api._bounded_text("INV-001", "invoice_number", maximum=api.INVOICE_NUMBER_MAX) == "INV-001"
    assert api._bounded_text("a" * api.INVOICE_NUMBER_MAX, "invoice_number", maximum=api.INVOICE_NUMBER_MAX) == "a" * api.INVOICE_NUMBER_MAX


def test_invoice_number_rejects_empty_and_overlong():
    for bad in ("", "   ", "a" * (api.INVOICE_NUMBER_MAX + 1)):
        with pytest.raises(HTTPException) as raised:
            api._bounded_text(bad, "invoice_number", required=True, maximum=api.INVOICE_NUMBER_MAX)
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "invoice_number", maximum=api.INVOICE_NUMBER_MAX)
    assert typed.value.status_code == 400

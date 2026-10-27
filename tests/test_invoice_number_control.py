import inspect

import pytest
from fastapi import HTTPException

import api


def test_invoices_reject_control_chars_in_invoice_number():
    source = inspect.getsource(api.invoices)
    assert "_reject_control_chars" in source
    assert "INVOICE_NUMBER_MAX" in source


def test_reject_control_chars_on_invoice_number():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("INV-1\x00", "invoice_number")
    assert exc.value.status_code == 400

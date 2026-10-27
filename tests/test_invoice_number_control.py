import inspect

import pytest
from fastapi import HTTPException

import api


def test_invoice_numbers_reject_control_chars():
    source = inspect.getsource(api.invoices)
    assert "_reject_control_chars" in source
    assert "INVOICE_NUMBER_MAX" in source


def test_reject_control_chars_on_invoice_number():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x00bad", "invoice_number")
    assert exc.value.status_code == 400

import pytest
from fastapi import HTTPException

import api


def test_api_wires_reject_on_postcode():
    text = open("api.py").read()
    assert '_reject_control_chars(_bounded_text(d.get("postcode"),"postcode",required=True,maximum=POSTCODE_MAX),"postcode")' in text


def test_reject_control_chars_on_postcode():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("CH45\x001AB", "postcode")
    assert exc.value.status_code == 400

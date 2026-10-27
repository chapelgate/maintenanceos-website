import inspect

import pytest
from fastapi import HTTPException

import api


def test_contractor_decision_max_is_16():
    assert api.CONTRACTOR_DECISION_MAX == 16
    source = inspect.getsource(api._require_contractor_decision)
    assert "CONTRACTOR_DECISION_MAX" in source


def test_contractor_decision_accepts_allowlisted_values():
    assert api._require_contractor_decision("accept") == "accept"
    assert api._require_contractor_decision("decline") == "decline"


def test_contractor_decision_rejects_overlong_before_allowlist():
    with pytest.raises(HTTPException) as exc:
        api._require_contractor_decision("a" * (api.CONTRACTOR_DECISION_MAX + 1))
    assert exc.value.status_code == 400
    assert "too long" in exc.value.detail


def test_contractor_decision_rejects_unknown_within_bound():
    with pytest.raises(HTTPException) as exc:
        api._require_contractor_decision("maybe")
    assert exc.value.status_code == 400
    assert exc.value.detail == "Invalid decision"

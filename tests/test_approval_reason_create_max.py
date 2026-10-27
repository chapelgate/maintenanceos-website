import inspect

import pytest

import decision_engine
import approval_text


def test_approval_reason_max_is_1000():
    assert approval_text.APPROVAL_REASON_MAX == 1000


def test_bounded_approval_reason_accepts_cap():
    value = "a" * approval_text.APPROVAL_REASON_MAX
    assert approval_text.bounded_approval_reason(value) == value


def test_bounded_approval_reason_rejects_blank_and_overlong():
    for bad in ("", "   ", "a" * (approval_text.APPROVAL_REASON_MAX + 1)):
        with pytest.raises(ValueError, match="approval reason invalid"):
            approval_text.bounded_approval_reason(bad)


def test_decision_engine_reason_sites_use_helper():
    source = inspect.getsource(decision_engine)
    assert source.count("bounded_approval_reason(") >= 3

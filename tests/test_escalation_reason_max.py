import inspect

import pytest

import decision_engine
import escalation_text
import worker


def test_escalation_reason_max_is_2000():
    assert escalation_text.ESCALATION_REASON_MAX == 2000


def test_bounded_escalation_reason_accepts_cap():
    value = "a" * escalation_text.ESCALATION_REASON_MAX
    assert escalation_text.bounded_escalation_reason(value) == value
    assert escalation_text.bounded_escalation_reason("  SLA breach  ") == "SLA breach"


def test_bounded_escalation_reason_rejects_blank_and_overlong():
    for bad in ("", "   ", "a" * (escalation_text.ESCALATION_REASON_MAX + 1)):
        with pytest.raises(ValueError, match="escalation reason invalid"):
            escalation_text.bounded_escalation_reason(bad)


def test_create_sites_use_helper():
    de = inspect.getsource(decision_engine)
    wk = inspect.getsource(worker)
    assert de.count("bounded_escalation_reason(") >= 2
    assert wk.count("bounded_escalation_reason(") >= 2

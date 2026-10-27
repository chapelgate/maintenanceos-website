import pytest

import operations


def test_escalation_reason_control_chars():
    assert operations.reason_has_control_chars("bad\x00reason")
    assert not operations.reason_has_control_chars("multi\nline\treason")


def test_resolve_escalation_code_contains_predicate():
    import inspect
    assert "reason_has_control_chars" in inspect.getsource(operations.resolve_escalation)

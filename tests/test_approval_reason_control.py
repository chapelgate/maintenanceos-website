import inspect

import operations


def test_reason_control_predicate_allows_multiline_text():
    assert not operations.reason_has_control_chars("line one\nline two\tvalue\r")
    assert operations.reason_has_control_chars("bad\x00value")


def test_approval_and_triage_fail_closed_on_control_chars_before_database_access():
    assert operations.approve_operational_action(1, 1, "valid\x00reason") is False
    assert operations.resolve_triage(1, 1, "PLUMBING", "plumber", "ROUTINE", "valid\x00reason") is False
    assert "reason_has_control_chars" in inspect.getsource(operations.approve_operational_action)
    assert "reason_has_control_chars" in inspect.getsource(operations.resolve_triage)

from unittest.mock import MagicMock

import pytest

import communications as comm


def test_queue_outbound_rejects_del_and_c1_in_recipient():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a\x7f@b.test", body="hello", action_key="k1")
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a\x80@b.test", body="hello", action_key="k1")


def test_queue_outbound_rejects_del_and_c1_in_action_key():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a@b.test", body="hello", action_key="k\x7fey")
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a@b.test", body="hello", action_key="k\x80ey")


def test_queue_outbound_rejects_del_and_c1_in_body():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a@b.test", body="hello\x7fworld", action_key="k1")
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a@b.test", body="hello\x80world", action_key="k1")


def test_queue_outbound_allows_tab_newline_cr_in_body():
    session = MagicMock()
    # Body allows tab/newline/CR - should not raise control error (will fail on DB but not control chars)
    body = "hello\tworld\nline\rend"
    try:
        comm.queue_outbound(session, client_id=1, work_order_id=1, channel="EMAIL", recipient="a@b.test", body=body, action_key="k1")
    except ValueError as e:
        if "control" in str(e):
            raise AssertionError(f"tab/newline/CR rejected: {e}")


def test_record_delivery_status_rejects_del_and_c1_in_provider_reference():
    session = MagicMock()
    assert not comm.record_delivery_status(session, 1, "SENT", provider_reference="ref\x7f")
    assert not comm.record_delivery_status(session, 1, "SENT", provider_reference="ref\x80")


def test_record_delivery_status_rejects_del_and_c1_in_failure_code():
    session = MagicMock()
    assert not comm.record_delivery_status(session, 1, "FAILED", failure_code="code\x7f")
    assert not comm.record_delivery_status(session, 1, "FAILED", failure_code="code\x80")


def test_helper_works_directly():
    assert not comm._has_control_chars("clean")
    assert comm._has_control_chars("with\x7f")
    assert comm._has_control_chars("with\x80")
    assert comm._has_control_chars("with\x9f")
    # body allows whitespace controls
    assert not comm._has_control_chars("with\t\n\r", allow_whitespace_controls=True)
    assert comm._has_control_chars("with\x00", allow_whitespace_controls=True)

import pytest
import ai_session_sim as ais


def test_helper_rejects_del_and_c1():
    assert ais._has_control_chars("clean") is False
    assert ais._has_control_chars("a" + chr(0x7F)) is True
    assert ais._has_control_chars("a" + chr(0x80)) is True
    assert ais._has_control_chars("a" + chr(0x9F)) is True
    assert ais._has_control_chars("a" + chr(0)) is True


def test_open_mock_ai_session_rejects_del_and_c1_in_call_sid():
    with pytest.raises(ValueError, match="control characters not allowed"):
        ais.open_mock_ai_session(call_sid="CA" + chr(0x7F), call_session_id=1, client_id=1)
    with pytest.raises(ValueError, match="control characters not allowed"):
        ais.open_mock_ai_session(call_sid="CA" + chr(0x80), call_session_id=1, client_id=1)

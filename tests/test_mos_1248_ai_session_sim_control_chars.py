import ai_session_sim
import pytest


def test_open_mock_ai_session_rejects_control_chars():
    with pytest.raises(ValueError, match="control characters not allowed"):
        ai_session_sim.open_mock_ai_session(call_sid="sid\x00", call_session_id=1, client_id=1)


def test_open_mock_ai_session_clean_call_sid():
    s = ai_session_sim.open_mock_ai_session(call_sid="CA123", call_session_id=999, client_id=1)
    assert s.call_sid == "CA123"
    ai_session_sim.close_mock_ai_session(999)

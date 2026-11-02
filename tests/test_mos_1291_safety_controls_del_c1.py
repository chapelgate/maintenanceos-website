from unittest.mock import MagicMock

import pytest

import safety_controls


def test_latch_critical_safety_rejects_del_and_c1_in_actor():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.latch_critical_safety(session, wo, [{"code": "GAS"}], "User" + chr(0x7F) + "1")
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.latch_critical_safety(session, wo, [{"code": "GAS"}], "User" + chr(0x80) + "1")


def test_clear_critical_safety_rejects_del_and_c1_in_reason():
    session = MagicMock()
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.clear_critical_safety(
            session,
            1,
            actor_user_id=1,
            reason="cleared" + chr(0x7F) + "ok enough",
            client_id=1,
        )
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.clear_critical_safety(
            session,
            1,
            actor_user_id=1,
            reason="cleared" + chr(0x80) + "ok enough",
            client_id=1,
        )
    session.get.assert_not_called()


def test_assert_status_change_allowed_rejects_del_and_c1():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    session.get.return_value = None
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.assert_status_change_allowed(session, wo, "NEW" + chr(0x7F))
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.assert_status_change_allowed(session, wo, "NEW" + chr(0x80))


def test_assert_status_change_allowed_accepts_clean():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    session.get.return_value = None
    safety_controls.assert_status_change_allowed(session, wo, "HUMAN_REVIEW")

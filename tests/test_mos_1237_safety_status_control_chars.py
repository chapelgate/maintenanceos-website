from unittest.mock import MagicMock

import pytest

import safety_controls


def test_assert_status_change_allowed_rejects_control_chars():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.assert_status_change_allowed(session, wo, "NEW" + chr(0))


def test_assert_status_change_allowed_allows_clean():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    safety_controls.assert_status_change_allowed(session, wo, "HUMAN_REVIEW")

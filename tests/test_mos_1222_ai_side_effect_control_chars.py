import pytest
from unittest.mock import MagicMock

import idempotency as ide


def test_set_ai_side_effects_rejects_actor_control_chars():
    session = MagicMock()
    session.get.return_value = None
    with pytest.raises(ValueError, match="actor control"):
        ide.set_ai_side_effects(session, True, actor="ops\x00lead", reason="enable")


def test_set_ai_side_effects_rejects_reason_control_chars():
    session = MagicMock()
    session.get.return_value = None
    with pytest.raises(ValueError, match="reason control"):
        ide.set_ai_side_effects(session, True, actor="ops", reason="urgent\x01toggle")


def test_set_ai_side_effects_accepts_clean():
    session = MagicMock()
    session.get.return_value = None
    ide.set_ai_side_effects(session, True, actor="ops", reason="enable for rollout")
    session.add.assert_called()

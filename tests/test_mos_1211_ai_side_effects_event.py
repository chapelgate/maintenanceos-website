from unittest.mock import MagicMock

import idempotency as idem


def test_set_ai_side_effects_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setattr(idem, "operational_event", capture)
    session = MagicMock()
    control = MagicMock()
    session.get.return_value = control
    idem.set_ai_side_effects(session, False, actor="ops", reason="maintenance window hold")
    assert any(
        name == "ai_side_effects_changed"
        and fields.get("outcome") == "disabled"
        and fields.get("reason_code") == "ai_side_effects"
        for name, fields in events
    )
    joined = " ".join(str(fields) for _, fields in events)
    assert "ops" not in joined
    assert "maintenance window" not in joined


def test_enable_outcome_is_enabled(monkeypatch):
    events = []
    monkeypatch.setattr(idem, "operational_event", lambda event, **fields: events.append((event, fields)))
    session = MagicMock()
    session.get.return_value = MagicMock()
    idem.set_ai_side_effects(session, True, actor="ops", reason="resume automation after review")
    assert events[0][1]["outcome"] == "enabled"

from datetime import datetime, timedelta

import pytest

from sla import known_urgency, sla_status


def test_sla_status_rejects_control_char_urgency():
    created = datetime(2026, 1, 1, 12, 0, 0)
    with pytest.raises(ValueError, match="urgency control characters"):
        sla_status("P1\x00", created)
    with pytest.raises(ValueError, match="urgency control characters"):
        sla_status("P\n1", created)


def test_sla_status_accepts_known_urgency():
    created = datetime(2026, 1, 1, 12, 0, 0)
    now = created + timedelta(minutes=10)
    status, age, target = sla_status("P1", created, now=now)
    assert status == "OK"
    assert target == 60
    assert known_urgency("P1") is True


def test_unknown_urgency_without_controls_keeps_default_target():
    created = datetime(2026, 1, 1, 12, 0, 0)
    status, age, target = sla_status("PX", created, now=created)
    assert target == 1440
    assert status == "OK"

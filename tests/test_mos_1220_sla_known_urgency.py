from datetime import datetime

from sla import TARGETS, known_urgency, sla_status


def test_known_urgency_accepts_targets():
    for code in TARGETS:
        assert known_urgency(code) is True


def test_known_urgency_rejects_unknown():
    assert known_urgency("P9") is False
    assert known_urgency("") is False
    assert known_urgency(None) is False


def test_sla_status_unchanged_for_known():
    created = datetime(2026, 1, 1, 12, 0, 0)
    now = datetime(2026, 1, 1, 12, 30, 0)
    status, age, target = sla_status("P1", created, now=now)
    assert status == "OK"
    assert age == 30.0
    assert target == 60

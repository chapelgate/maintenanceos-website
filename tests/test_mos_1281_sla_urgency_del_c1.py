from datetime import datetime, timedelta

import pytest

from sla import known_urgency, sla_status


def test_sla_status_rejects_del_urgency():
    created = datetime(2026, 1, 1, 12, 0, 0)
    with pytest.raises(ValueError, match="urgency control characters"):
        sla_status("P1\x7f", created)


def test_sla_status_rejects_c1_urgency():
    created = datetime(2026, 1, 1, 12, 0, 0)
    with pytest.raises(ValueError, match="urgency control characters"):
        sla_status("P\x801", created)
    with pytest.raises(ValueError, match="urgency control characters"):
        sla_status("P1\x9f", created)


def test_sla_status_accepts_clean_p1():
    created = datetime(2026, 1, 1, 12, 0, 0)
    now = created + timedelta(minutes=10)
    status, age, target = sla_status("P1", created, now=now)
    assert status == "OK"
    assert target == 60
    assert known_urgency("P1") is True

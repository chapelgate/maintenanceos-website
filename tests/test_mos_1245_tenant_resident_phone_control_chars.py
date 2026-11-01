from unittest.mock import MagicMock

import tenant_security


def test_resident_by_phone_for_client_rejects_control_chars():
    session = MagicMock()
    session.query.return_value.filter_by.return_value.all.return_value = []
    assert tenant_security.resident_by_phone_for_client(session, 1, "+447123\x00456") is None


def test_resident_by_phone_for_client_accepts_clean():
    resident = MagicMock()
    resident.phone = "+447123456789"
    session = MagicMock()
    session.query.return_value.filter_by.return_value.all.return_value = [resident]
    assert tenant_security.resident_by_phone_for_client(session, 1, "+447123456789") == resident

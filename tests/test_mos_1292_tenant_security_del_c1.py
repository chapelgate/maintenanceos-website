from unittest.mock import MagicMock

import tenant_security


def test_resident_by_phone_rejects_del_and_c1():
    session = MagicMock()
    assert tenant_security.resident_by_phone_for_client(session, 1, "+447123" + chr(0x7F) + "456") is None
    assert tenant_security.resident_by_phone_for_client(session, 1, "+447123" + chr(0x80) + "456") is None
    assert tenant_security.resident_by_phone_for_client(session, 1, "+447123" + chr(0x9F) + "456") is None
    session.query.assert_not_called()


def test_helper_rejects_del_and_c1_directly():
    assert tenant_security._has_control_chars("clean") is False
    assert tenant_security._has_control_chars("a" + chr(0x7F)) is True
    assert tenant_security._has_control_chars("a" + chr(0x80)) is True
    assert tenant_security._has_control_chars("a" + chr(0)) is True

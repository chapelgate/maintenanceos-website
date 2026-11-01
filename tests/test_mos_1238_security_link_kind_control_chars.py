import pytest

import security


def test_sign_link_rejects_control_chars_in_kind():
    with pytest.raises(ValueError, match="unsupported link kind"):
        security.sign_link("accept\x00", 1, 1)


def test_verify_link_rejects_control_chars_in_kind():
    assert security.verify_link("accept\x00", 1, 1, "123.sig") is False


def test_sign_link_accepts_clean():
    with pytest.raises(RuntimeError, match="APP_SECRET is not configured"):
        security.sign_link("accept", 1, 1)


def test_verify_link_accepts_clean():
    assert security.verify_link("accept", 1, 1, "123.sig") is False

from secret_patterns import SENSITIVE_KEY, secret_key_known


def test_secret_key_known_matches_sensitive():
    for name in ("authorization", "password", "token", "secret", "email", "phone", "credential"):
        assert secret_key_known(name) is True
    assert secret_key_known("Authorization") is True  # case insensitive
    assert secret_key_known("custom_password_field") is True


def test_secret_key_known_rejects_invalid():
    assert secret_key_known("") is False
    assert secret_key_known("not_sensitive") is False
    assert secret_key_known("password\x00") is False
    assert secret_key_known("\x01") is False

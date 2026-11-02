import secret_patterns as sp


def test_secret_key_known_rejects_del_and_c1():
    # DEL and C1 are rejected regardless of feature completeness
    assert sp.secret_key_known("password" + chr(0x7F)) is False
    assert sp.secret_key_known("password" + chr(0x80)) is False
    assert sp.secret_key_known("password" + chr(0x9F)) is False
    assert sp.secret_key_known("password" + chr(0)) is False
    assert sp.secret_key_known("secret" + chr(0x7F)) is False
    assert sp.secret_key_known("token" + chr(0x80)) is False


def test_secret_key_known_accepts_clean_sensitive_keys():
    # clean sensitive keys still return True
    assert sp.secret_key_known("password") is True
    assert sp.secret_key_known("secret") is True
    assert sp.secret_key_known("key") is True
    assert sp.secret_key_known("token") is True


def test_secret_key_known_rejects_non_sensitive_with_controls():
    # non-sensitive keys with control chars still False (feature check fails first)
    assert sp.secret_key_known("clean" + chr(0x7F)) is False
    assert sp.secret_key_known("clean" + chr(0x80)) is False


def test_secret_key_known_rejects_empty_and_c0():
    assert sp.secret_key_known("") is False
    assert sp.secret_key_known("pass\x00word") is False

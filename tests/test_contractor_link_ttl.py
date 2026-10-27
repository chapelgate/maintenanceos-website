import inspect

import operations
import security


def test_contractor_link_ttl_bounds():
    assert security.CONTRACTOR_LINK_TTL_DEFAULT == 86400
    assert security.CONTRACTOR_LINK_TTL_MIN == 300
    assert security.CONTRACTOR_LINK_TTL_MAX == 604800
    source = inspect.getsource(operations.contractor_portal_links)
    assert "contractor_link_expires_at" in source
    sign_source = inspect.getsource(security.sign_link)
    assert "contractor_link_ttl_seconds()" in sign_source
    assert 'os.getenv("CONTRACTOR_LINK_TTL_SECONDS"' not in sign_source


def test_contractor_link_ttl_accepts_inclusive_range(monkeypatch):
    monkeypatch.setenv("CONTRACTOR_LINK_TTL_SECONDS", "3600")
    assert security.contractor_link_ttl_seconds() == 3600
    assert security.contractor_link_expires_at(1000) == 4600
    monkeypatch.setenv("CONTRACTOR_LINK_TTL_SECONDS", "300")
    assert security.contractor_link_ttl_seconds() == 300
    monkeypatch.setenv("CONTRACTOR_LINK_TTL_SECONDS", "604800")
    assert security.contractor_link_ttl_seconds() == 604800


def test_contractor_link_ttl_out_of_range_uses_one_day(monkeypatch):
    for bad in ("", "0", "299", "604801", "999999999", "abc", "-1", "86400.5"):
        monkeypatch.setenv("CONTRACTOR_LINK_TTL_SECONDS", bad)
        assert security.contractor_link_ttl_seconds() == security.CONTRACTOR_LINK_TTL_DEFAULT
    monkeypatch.delenv("CONTRACTOR_LINK_TTL_SECONDS", raising=False)
    assert security.contractor_link_ttl_seconds() == security.CONTRACTOR_LINK_TTL_DEFAULT

def test_sign_link_default_ttl_uses_clamped_helper(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    monkeypatch.setenv("CONTRACTOR_LINK_TTL_SECONDS", "999999999")
    token = security.sign_link("accept", 1, 2, expires_at=None)
    expiry = int(token.split(".", 1)[0])
    now = int(__import__("time").time())
    assert abs(expiry - (now + security.CONTRACTOR_LINK_TTL_DEFAULT)) < 3

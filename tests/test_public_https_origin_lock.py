import readiness
from webhook_security import public_https_origin_ready


def test_public_https_origin_accepts_bare_https(monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com")
    assert public_https_origin_ready() is True
    assert readiness.CHECKS["public_https_url"]() is True

    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com/")
    assert public_https_origin_ready() is True

    monkeypatch.setenv("PUBLIC_BASE_URL", "  https://pilot.example.com  ")
    assert public_https_origin_ready() is True


def test_public_https_origin_rejects_userinfo_query_fragment_path(monkeypatch):
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://user:pass@pilot.example.com")
    assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com?x=1")
    assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com#frag")
    assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "https://pilot.example.com/voice")
    assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "http://pilot.example.com")
    assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "")
    assert public_https_origin_ready() is False
    assert readiness.CHECKS["public_https_url"]() is False


def test_public_https_origin_rejects_loopback_and_placeholder(monkeypatch):
    for host in ("localhost", "127.0.0.1", "::1"):
        monkeypatch.setenv("PUBLIC_BASE_URL", f"https://{host}")
        assert public_https_origin_ready() is False

    monkeypatch.setenv("PUBLIC_BASE_URL", "https://your-public-domain.example")
    assert public_https_origin_ready() is False

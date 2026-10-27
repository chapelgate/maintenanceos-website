from pathlib import Path


def test_dashboard_login_autocomplete():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert 'autocomplete="username"' in source
    assert 'autocomplete="current-password"' in source
    assert "max_chars=EMAIL_LOOKUP_MAX" in source
    assert "max_chars=LOGIN_PASSWORD_MAX" in source

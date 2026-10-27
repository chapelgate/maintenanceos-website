from pathlib import Path


def test_dashboard_login_email_type():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert 'type="email"' in source
    assert 'autocomplete="username"' in source
    assert "max_chars=EMAIL_LOOKUP_MAX" in source

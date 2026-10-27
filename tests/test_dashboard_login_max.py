from pathlib import Path

import channels
import security


def test_login_maxima():
    assert channels.EMAIL_LOOKUP_MAX == 320
    assert security.LOGIN_PASSWORD_MAX == 200


def test_verify_password_rejects_overlong():
    assert security.verify_password("a" * (security.LOGIN_PASSWORD_MAX + 1), "unused") is False


def test_hash_password_rejects_overlong():
    try:
        security.hash_password("a" * (security.LOGIN_PASSWORD_MAX + 1))
    except ValueError as exc:
        assert "too long" in str(exc)
    else:
        raise AssertionError("expected ValueError")


def test_dashboard_wires_login_bounds():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "EMAIL_LOOKUP_MAX" in source
    assert "LOGIN_PASSWORD_MAX" in source
    assert "Email is too long" in source
    assert "Password is too long" in source

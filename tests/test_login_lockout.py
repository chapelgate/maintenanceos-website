from pathlib import Path

import security


def setup_function():
    security._login_failures.clear()


def test_lockout_constants():
    assert security.LOGIN_LOCKOUT_MAX_ATTEMPTS == 5
    assert security.LOGIN_LOCKOUT_WINDOW_SECONDS == 900


def test_five_failures_lock_email():
    email = "pilot@example.com"
    now = 1_700_000_000.0
    for i in range(security.LOGIN_LOCKOUT_MAX_ATTEMPTS):
        assert not security.login_is_locked(email, now=now + i)
        security.record_login_failure(email, now=now + i)
    assert security.login_is_locked(email, now=now + security.LOGIN_LOCKOUT_MAX_ATTEMPTS)


def test_successful_clear_unlocks():
    email = "pilot@example.com"
    now = 1_700_000_000.0
    for i in range(security.LOGIN_LOCKOUT_MAX_ATTEMPTS):
        security.record_login_failure(email, now=now + i)
    assert security.login_is_locked(email, now=now + 10)
    security.clear_login_failures(email)
    assert not security.login_is_locked(email, now=now + 11)


def test_window_expiry_clears_lock():
    email = "pilot@example.com"
    now = 1_700_000_000.0
    for i in range(security.LOGIN_LOCKOUT_MAX_ATTEMPTS):
        security.record_login_failure(email, now=now + i)
    later = now + security.LOGIN_LOCKOUT_WINDOW_SECONDS + 1
    assert not security.login_is_locked(email, now=later)


def test_dashboard_auth_uses_lockout():
    text = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text()
    assert "login_is_locked" in text
    assert "record_login_failure" in text
    assert "clear_login_failures" in text
    assert "Too many failed sign-in attempts" in text

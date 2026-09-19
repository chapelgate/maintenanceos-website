import email_gateway


def _live_resend_env(monkeypatch):
    monkeypatch.setenv("EMAIL_MODE", "imap_smtp")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.resend.com")
    monkeypatch.setenv("SMTP_USERNAME", "resend")
    monkeypatch.setenv("SMTP_PASSWORD", "re_test_key")
    monkeypatch.setenv("SMTP_FROM", "info@example.test")


def test_pilot_armed_resend_bypasses_live_email_flag(monkeypatch):
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    monkeypatch.setenv("EMAIL_MODE", "mock")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "false")
    monkeypatch.setenv("SMTP_FROM", "info@chapelgateservices.com")
    monkeypatch.setenv("SMTP_USERNAME", "resend")
    monkeypatch.setenv("SMTP_PASSWORD", "re_test_key")
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    assert email_gateway.pilot_resend_ready() is True
    calls = []
    monkeypatch.setattr(
        email_gateway,
        "_send_resend_http",
        lambda to, subject, body, sender, api_key: calls.append((to, sender, api_key))
        or {"mock": False, "message_id": "pilot-id", "provider": "resend_https"},
    )
    result = email_gateway.send_email("chapelgate@gmail.com", "subject", "body")
    assert result["message_id"] == "pilot-id"
    assert calls == [("chapelgate@gmail.com", "info@chapelgateservices.com", "re_test_key")]


def test_resend_smtp_configuration_prefers_https_api(monkeypatch):
    _live_resend_env(monkeypatch)
    calls = []

    def fake_http(to, subject, body, sender, api_key):
        calls.append((to, subject, body, sender, api_key))
        return {"mock": False, "message_id": "http-id", "provider": "resend_https"}

    monkeypatch.setattr(email_gateway, "_send_resend_http", fake_http)
    result = email_gateway.send_email("dest@example.test", "subject", "body")
    assert result["message_id"] == "http-id"
    assert calls == [("dest@example.test", "subject", "body", "info@example.test", "re_test_key")]


def test_voice_path_does_not_fall_back_to_smtp(monkeypatch):
    _live_resend_env(monkeypatch)
    monkeypatch.setattr(
        email_gateway,
        "_send_resend_http",
        lambda *_a, **_k: (_ for _ in ()).throw(RuntimeError("api down")),
    )
    try:
        email_gateway.send_email("dest@example.test", "subject", "body", allow_smtp_fallback=False)
        assert False, "expected resend failure to raise without SMTP fallback"
    except RuntimeError as exc:
        assert "api down" in str(exc) or "resend" in str(exc).lower()


def test_resend_http_failure_falls_back_to_smtp_when_explicitly_allowed(monkeypatch):
    _live_resend_env(monkeypatch)
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    # Force HTTPS path to fail by clearing inferred key after env set — use empty key path:
    monkeypatch.setenv("SMTP_USERNAME", "not-resend")
    monkeypatch.setenv("SMTP_PASSWORD", "not-a-resend-key")
    monkeypatch.setenv("SMTP_HOST", "smtp.example.test")

    sent = []
    class FakeSMTP:
        def __init__(self, host, port, timeout):
            self.host, self.port, self.timeout = host, port, timeout
            assert timeout <= 10
        def __enter__(self): return self
        def __exit__(self, *_a): return False
        def starttls(self): pass
        def login(self, user, pw): pass
        def send_message(self, msg): sent.append(msg)

    monkeypatch.setattr(email_gateway.smtplib, "SMTP", FakeSMTP)
    result = email_gateway.send_email(
        "dest@example.test", "subject", "body", allow_smtp_fallback=True
    )
    assert result["mock"] is False
    assert len(sent) == 1

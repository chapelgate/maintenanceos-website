import email_gateway


def _live_resend_env(monkeypatch):
    monkeypatch.setenv("EMAIL_MODE", "imap_smtp")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "true")
    monkeypatch.setenv("SMTP_HOST", "smtp.resend.com")
    monkeypatch.setenv("SMTP_USERNAME", "resend")
    monkeypatch.setenv("SMTP_PASSWORD", "re_test_key")
    monkeypatch.setenv("SMTP_FROM", "info@example.test")


def test_resend_smtp_configuration_prefers_https_api(monkeypatch):
    _live_resend_env(monkeypatch)
    calls = []

    def fake_http(to, subject, body, sender, api_key):
        calls.append((to, subject, body, sender, api_key))
        return {"mock": False, "message_id": "http-id"}

    monkeypatch.setattr(email_gateway, "_send_resend_http", fake_http)
    result = email_gateway.send_email("dest@example.test", "subject", "body")
    assert result["message_id"] == "http-id"
    assert calls == [("dest@example.test", "subject", "body", "info@example.test", "re_test_key")]


def test_resend_http_failure_falls_back_to_smtp(monkeypatch):
    _live_resend_env(monkeypatch)
    monkeypatch.setattr(email_gateway, "_send_resend_http", lambda *_a, **_k: (_ for _ in ()).throw(RuntimeError("api down")))

    sent = []
    class FakeSMTP:
        def __init__(self, host, port, timeout):
            self.host, self.port, self.timeout = host, port, timeout
        def __enter__(self): return self
        def __exit__(self, *_a): return False
        def starttls(self): pass
        def login(self, user, pw): pass
        def send_message(self, msg): sent.append(msg)

    monkeypatch.setattr(email_gateway.smtplib, "SMTP", FakeSMTP)
    result = email_gateway.send_email("dest@example.test", "subject", "body")
    assert result["mock"] is False
    assert len(sent) == 1

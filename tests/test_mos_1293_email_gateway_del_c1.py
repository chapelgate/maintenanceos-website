import email_gateway


def test_helper_rejects_del_and_c1():
    assert email_gateway._has_control_chars("clean") is False
    assert email_gateway._has_control_chars("a" + chr(0x7F)) is True
    assert email_gateway._has_control_chars("a" + chr(0x80)) is True
    assert email_gateway._has_control_chars("a" + chr(0x9F)) is True
    assert email_gateway._has_control_chars("a" + chr(0)) is True


def test_sender_address_rejects_del_and_c1(monkeypatch):
    monkeypatch.setattr(email_gateway.os, "getenv", lambda key, default="": "user" + chr(0x7F))
    assert email_gateway._sender_address() == ""
    monkeypatch.setattr(email_gateway.os, "getenv", lambda key, default="": "from" + chr(0x80))
    assert email_gateway._sender_address() == ""


def test_resend_api_key_rejects_del_and_c1(monkeypatch):
    monkeypatch.setattr(email_gateway.os, "getenv", lambda key, default="": "re_" + chr(0x7F) + "key")
    assert email_gateway._resend_api_key() == ""
    monkeypatch.setattr(email_gateway.os, "getenv", lambda key, default="": "re_" + chr(0x80) + "key")
    assert email_gateway._resend_api_key() == ""


def test_smtp_configured_rejects_del(monkeypatch):
    def getter(key, default=""):
        return {
            "SMTP_HOST": "host" + chr(0x7F),
            "SMTP_USERNAME": "user",
            "SMTP_PASSWORD": "pw",
            "SMTP_FROM": "from",
        }.get(key, default)
    monkeypatch.setattr(email_gateway.os, "getenv", getter)
    assert email_gateway.smtp_configured() is False


def test_live_email_enabled_rejects_c1(monkeypatch):
    def getter(key, default=""):
        return {
            "EMAIL_MODE": "imap_smtp" + chr(0x80),
            "ENABLE_LIVE_EMAIL": "true",
        }.get(key, default)
    monkeypatch.setattr(email_gateway.os, "getenv", getter)
    assert email_gateway.live_email_enabled() is False

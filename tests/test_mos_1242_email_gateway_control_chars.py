import os
from unittest import mock

import email_gateway


def test_sender_address_rejects_control_chars(monkeypatch):
    monkeypatch.setattr(email_gateway.os, 'getenv', lambda key, default="": "user\x00")
    assert email_gateway._sender_address() == ""
    monkeypatch.setattr(email_gateway.os, 'getenv', lambda key, default="": "from\x00")
    assert email_gateway._sender_address() == ""


def test_resend_api_key_rejects_control_chars(monkeypatch):
    monkeypatch.setattr(email_gateway.os, 'getenv', lambda key, default="": "re_\x00key")
    assert email_gateway._resend_api_key() == ""


def test_smtp_configured_rejects_control_chars(monkeypatch):
    def getter(key, default=""):
        return {"SMTP_HOST": "host\x00", "SMTP_USERNAME": "user", "SMTP_PASSWORD": "pw", "SMTP_FROM": "from"}.get(key, default)
    monkeypatch.setattr(email_gateway.os, 'getenv', getter)
    assert email_gateway.smtp_configured() is False


def test_live_email_enabled_rejects_control_chars(monkeypatch):
    def getter(key, default=""):
        return {"EMAIL_MODE": "imap_smtp\x00", "ENABLE_LIVE_EMAIL": "true"}.get(key, default)
    monkeypatch.setattr(email_gateway.os, 'getenv', getter)
    assert email_gateway.live_email_enabled() is False


def test_pilot_resend_ready_rejects_control_chars(monkeypatch):
    def getter(key, default=""):
        return {"PILOT_MODE_ARMED": "true", "RESEND_API_KEY": "re_\x00key", "SMTP_USERNAME": "user"}.get(key, default)
    monkeypatch.setattr(email_gateway.os, 'getenv', getter)
    assert email_gateway.pilot_resend_ready() is False


def test_email_gate_status_safe():
    result = email_gateway.email_gate_status()
    assert isinstance(result, dict)
    for k, v in result.items():
        assert isinstance(v, bool)

import inspect

import pytest
from fastapi import HTTPException

import api
import email_gateway


def test_api_idempotency_key_max_is_200():
    assert api.IDEMPOTENCY_KEY_MAX == 200
    source = inspect.getsource(api.appointment_confirm)
    assert "IDEMPOTENCY_KEY_MAX" in source
    create_source = inspect.getsource(api.create_work_order)
    assert "IDEMPOTENCY_KEY_MAX" in create_source


def test_api_idempotency_key_strips_and_rejects_overlong():
    assert api._bounded_text("  abc  ", "Idempotency-Key", maximum=api.IDEMPOTENCY_KEY_MAX) == "abc"
    assert api._bounded_text("a" * 200, "Idempotency-Key", maximum=api.IDEMPOTENCY_KEY_MAX) == "a" * 200
    with pytest.raises(HTTPException) as long:
        api._bounded_text("a" * 201, "Idempotency-Key", maximum=api.IDEMPOTENCY_KEY_MAX)
    assert long.value.status_code == 400
    with pytest.raises(HTTPException) as blank:
        api._bounded_text("   ", "Idempotency-Key", required=True, maximum=api.IDEMPOTENCY_KEY_MAX)
    assert blank.value.status_code == 400
    assert (
        api._bounded_text("", "Idempotency-Key", maximum=api.IDEMPOTENCY_KEY_MAX) or None
    ) is None


def test_resend_idempotency_key_bounds(monkeypatch):
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def read(self):
            return b'{"id":"email_1"}'

    def fake_urlopen(req, timeout=10):
        captured["headers"] = {k.lower(): v for k, v in req.header_items()}
        return FakeResponse()

    monkeypatch.setattr(email_gateway.urllib.request, "urlopen", fake_urlopen)
    email_gateway._send_resend_http(
        "to@example.com",
        "subject",
        "body",
        "from@example.com",
        "re_test",
        idempotency_key="  ok-key  ",
    )
    assert captured["headers"]["idempotency-key"] == "ok-key"

    with pytest.raises(ValueError, match="invalid_resend_idempotency_key"):
        email_gateway._send_resend_http(
            "to@example.com",
            "subject",
            "body",
            "from@example.com",
            "re_test",
            idempotency_key="a" * 257,
        )
    with pytest.raises(ValueError, match="invalid_resend_idempotency_key"):
        email_gateway._send_resend_http(
            "to@example.com",
            "subject",
            "body",
            "from@example.com",
            "re_test",
            idempotency_key="   ",
        )

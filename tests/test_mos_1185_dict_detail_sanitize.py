from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail


def test_sanitize_http_detail_redacts_secret_dict_values():
    out = sanitize_http_detail(
        {
            "email": "resident@example.test",
            "token": "Bearer leak-token-value",
            "note": "sk-abcdefghijklmnop",
            "ok": 1,
            "code": "x",
        }
    )
    assert isinstance(out, dict)
    assert out["ok"] == 1
    assert out["code"] == "x"
    assert out["email"] == "[REDACTED]"
    assert out["token"] == "[REDACTED]"
    assert "sk-abcdefghijklmnop" not in out["note"]
    assert "[REDACTED]" in out["note"]


def test_sanitize_http_detail_redacts_nested_list_secrets():
    out = sanitize_http_detail({"items": ["Bearer nested-secret", {"phone": "+447700900123"}]})
    assert isinstance(out, dict)
    assert "nested-secret" not in out["items"][0]
    assert out["items"][1]["phone"] == "[REDACTED]"


def test_http_exception_handler_redacts_dict_detail():
    @api.app.get("/__test_dict_sanitize_error")
    def _boom():
        raise HTTPException(
            403,
            {
                "email": "resident@example.test",
                "token": "Bearer leak-token-value",
                "ok": True,
            },
        )

    try:
        response = TestClient(api.app).get("/__test_dict_sanitize_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert isinstance(detail, dict)
        assert detail["ok"] is True
        assert detail["email"] == "[REDACTED]"
        assert detail["token"] == "[REDACTED]"
        assert "resident@example.test" not in response.text
        assert "leak-token-value" not in response.text
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_dict_sanitize_error"
        ]

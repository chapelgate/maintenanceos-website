import operational_logging as ol
import product_profile
from http_error_text import sanitize_http_detail


def test_operational_logging_no_crash_on_bad_event(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    ol.operational_event(None)  # type: ignore[arg-type]
    ol.operational_event("ok", password="secret")


def test_config_error_message_is_clear(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "not-real")
    try:
        product_profile.api_title()
        raise AssertionError("expected ProductProfileError")
    except product_profile.ProductProfileError as exc:
        assert "Unknown product profile" in str(exc)


def test_error_detail_sanitized():
    out = sanitize_http_detail("Bearer abc user@example.com")
    assert "Bearer abc" not in out
    assert "user@example.com" not in out

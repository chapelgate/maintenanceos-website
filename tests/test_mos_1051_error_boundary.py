import operational_logging as ol
import product_profile


def test_operational_logging_no_crash_on_bad_event(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    ol.operational_event(None)  # type: ignore[arg-type]
    ol.operational_event("ok", password="secret", status=1)


def test_import_boundary_no_crash():
    import api  # noqa: F401
    import audit_text  # noqa: F401
    import http_error_text  # noqa: F401


def test_config_error_message_is_clear(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "not-real")
    try:
        product_profile.api_title()
        raise AssertionError("expected ProductProfileError")
    except product_profile.ProductProfileError as exc:
        assert "Unknown product profile" in str(exc)

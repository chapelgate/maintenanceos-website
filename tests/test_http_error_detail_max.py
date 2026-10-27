from http_error_text import HTTP_ERROR_DETAIL_MAX, sanitize_http_detail


def test_http_error_detail_max_is_2000():
    assert HTTP_ERROR_DETAIL_MAX == 2000


def test_sanitize_clips_after_redaction():
    raw = "x" * (HTTP_ERROR_DETAIL_MAX + 50)
    out = sanitize_http_detail(raw)
    assert isinstance(out, str)
    assert len(out) == HTTP_ERROR_DETAIL_MAX


def test_sanitize_preserves_short_and_non_string():
    assert sanitize_http_detail("short") == "short"
    assert sanitize_http_detail({"a": 1}) == {"a": 1}
    assert sanitize_http_detail(None) is None

import json

from http_error_text import HTTP_ERROR_DETAIL_MAX, HTTP_ERROR_JSON_MAX, sanitize_http_detail


def test_oversized_list_detail_collapses():
    detail = ["x" * HTTP_ERROR_DETAIL_MAX for _ in range(50)]
    out = sanitize_http_detail(detail)
    assert out == {"_truncated": True, "size_limit": HTTP_ERROR_JSON_MAX}


def test_small_structure_preserved():
    detail = {"code": "bad_request", "fields": ["a", "b"]}
    out = sanitize_http_detail(detail)
    assert out == detail
    assert len(json.dumps(out)) <= HTTP_ERROR_JSON_MAX

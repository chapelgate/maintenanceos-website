from http_error_text import sanitize_http_detail, sanitize_json_payload
from secret_patterns import redact_secrets


def test_sanitize_http_detail_strips_del_and_c1():
    out = sanitize_http_detail("a\x7fb\x80c\x9fd")
    assert out == "abcd"
    assert "\x7f" not in out
    assert "\x80" not in out
    assert "\x9f" not in out


def test_sanitize_http_detail_keeps_tab_newline_with_c1_present():
    out = sanitize_http_detail("ok\tline\n\x85bad")
    assert "\t" in out
    assert "\n" in out
    assert "\x85" not in out
    assert out == "ok\tline\nbad"


def test_sanitize_structure_strips_c1_in_dict():
    out = sanitize_http_detail({"msg": "x\x9ay", "n": 1})
    assert out == {"msg": "xy", "n": 1}


def test_sanitize_json_payload_strips_del_and_c1():
    out = sanitize_json_payload("p\x7fq\x9fr")
    assert out == "pqr"


def test_redact_secrets_strips_del_and_c1_while_redacting():
    out = redact_secrets("pre\x7fBearer sk-abcdefghijklmnop\x9fpost")
    assert "\x7f" not in out
    assert "\x9f" not in out
    assert "[REDACTED]" in out
    assert "sk-abcdefghijklmnop" not in out

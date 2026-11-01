from http_error_text import sanitize_http_detail, sanitize_json_payload


def test_sanitize_http_detail_strips_c0_controls():
    out = sanitize_http_detail("fail\x00mid\x01end")
    assert out == "failmidend"
    assert "\x00" not in out


def test_sanitize_http_detail_keeps_tab_newline_and_redacts():
    out = sanitize_http_detail("line1\nBearer sk-abcdefghijklmnop\tok")
    assert "\n" in out
    assert "\t" in out
    assert "[REDACTED]" in out
    assert "sk-abcdefghijklmnop" not in out


def test_sanitize_structure_strips_controls_in_dict():
    out = sanitize_http_detail({"msg": "bad\x00value", "ok": "fine"})
    assert out == {"msg": "badvalue", "ok": "fine"}


def test_sanitize_json_payload_strips_controls():
    out = sanitize_json_payload("x\x00y")
    assert out == "xy"

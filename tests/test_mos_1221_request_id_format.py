import request_context as rc


def setup_function():
    rc.clear_request_id()


def test_set_request_id_rejects_control_chars():
    rc.set_request_id("abc\x00def")
    assert rc.request_id() == ""


def test_set_request_id_rejects_overlong():
    rc.set_request_id("x" * (rc.REQUEST_ID_MAX + 1))
    assert rc.request_id() == ""


def test_set_request_id_accepts_bounded():
    rc.set_request_id("req-123")
    assert rc.request_id() == "req-123"

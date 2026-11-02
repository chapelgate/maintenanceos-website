import request_context as rc


def test_set_request_id_rejects_del_and_c1():
    rc.set_request_id("clean" + chr(0x7F))
    assert rc.request_id() == ""
    rc.set_request_id("clean" + chr(0x80))
    assert rc.request_id() == ""
    rc.set_request_id("clean" + chr(0x9F))
    assert rc.request_id() == ""
    rc.set_request_id("clean" + chr(0))
    assert rc.request_id() == ""


def test_set_request_id_accepts_clean():
    rc.set_request_id("req-123")
    assert rc.request_id() == "req-123"


def test_set_request_id_truncates_too_long():
    rc.set_request_id("x" * 200)
    assert rc.request_id() == ""

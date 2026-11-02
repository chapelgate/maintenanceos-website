import security as sec


def test_sign_link_rejects_del_and_c1():
    for ch in (chr(0x7F), chr(0x80), chr(0x9F), chr(0)):
        try:
            sec.sign_link("accept" + ch, 1, 1)
            assert False, f"expected ValueError for {repr(ch)}"
        except ValueError:
            pass


def test_verify_link_rejects_del_and_c1():
    for ch in (chr(0x7F), chr(0x80), chr(0x9F), chr(0)):
        assert sec.verify_link("accept" + ch, 1, 1, "123.sig") is False


def test_sign_link_rejects_empty_kind():
    try:
        sec.sign_link("", 1, 1)
        assert False, "expected ValueError for empty kind"
    except ValueError:
        pass

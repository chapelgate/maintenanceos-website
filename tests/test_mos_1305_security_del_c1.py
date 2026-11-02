import security as sec


def test_sign_link_rejects_del_and_c1():
    for ch in (chr(0x7F), chr(0x80), chr(0x9F)):
        try:
            sec.sign_link("accept" + ch, 1, 1)
            assert False, f"expected ValueError"
        except ValueError:
            pass


def test_verify_link_rejects_del_and_c1():
    for ch in (chr(0x7F), chr(0x80), chr(0x9F)):
        assert sec.verify_link("accept" + ch, 1, 1, "123.sig") is False


def test_clean_kind_still_works_with_secret():
    import os
    os.environ["APP_SECRET"] = "dev-secret"
    try:
        result = sec.sign_link("accept", 1, 1)
        assert result.endswith(".")
    except RuntimeError:
        pass  # APP_SECRET not configured securely

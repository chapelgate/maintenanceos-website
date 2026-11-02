import webhook_security


def test_validate_twilio_rejects_del_and_c1_in_url():
    assert webhook_security.validate_twilio("http://bad" + chr(0x7F), {}, "sig") is False
    assert webhook_security.validate_twilio("http://bad" + chr(0x80), {}, "sig") is False
    assert webhook_security.validate_twilio("http://bad" + chr(0x9F), {}, "sig") is False


def test_validate_twilio_rejects_del_and_c1_in_signature():
    assert webhook_security.validate_twilio("http://x", {}, "sig" + chr(0x7F)) is False
    assert webhook_security.validate_twilio("http://x", {}, "sig" + chr(0x80)) is False


def test_validate_twilio_websocket_rejects_del_and_c1():
    assert webhook_security.validate_twilio_websocket("wss://x" + chr(0x7F), "sig") is False
    assert webhook_security.validate_twilio_websocket("wss://x" + chr(0x80), "sig") is False
    assert webhook_security.validate_twilio_websocket("wss://x", "sig" + chr(0x7F)) is False
    assert webhook_security.validate_twilio_websocket("wss://x", "sig" + chr(0x80)) is False


def test_helper_rejects_del_and_c1_directly():
    assert webhook_security._has_control_chars("clean") is False
    assert webhook_security._has_control_chars("a" + chr(0x7F)) is True
    assert webhook_security._has_control_chars("a" + chr(0x80)) is True
    assert webhook_security._has_control_chars("a" + chr(0x9F)) is True
    assert webhook_security._has_control_chars("a" + chr(0)) is True

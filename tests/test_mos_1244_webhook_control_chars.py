import webhook_security


def test_validate_twilio_rejects_control_chars_in_url():
    assert webhook_security.validate_twilio("http://bad\x00", {}, "sig") is False


def test_validate_twilio_rejects_control_chars_in_signature():
    assert webhook_security.validate_twilio("http://x", {}, "sig\x01") is False


def test_validate_twilio_websocket_rejects_control_chars():
    assert webhook_security.validate_twilio_websocket("wss://x\x00", "sig") is False
    assert webhook_security.validate_twilio_websocket("wss://x", "sig\x01") is False

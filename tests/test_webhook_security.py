from twilio.request_validator import RequestValidator

from webhook_security import validate_twilio,validate_twilio_websocket


def test_twilio_http_signature_fails_closed_and_validates(monkeypatch):
    url="https://pilot.example.com/voice/inbound"
    params={"CallSid":"CA-test","From":"+440000000000"}
    token="test-token"
    signature=RequestValidator(token).compute_signature(url,params)
    monkeypatch.setenv("TWILIO_AUTH_TOKEN",token)
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES","false")
    assert not validate_twilio(url,params,signature)
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES","true")
    assert validate_twilio(url,params,signature)
    assert not validate_twilio(url,params,"bad")


def test_twilio_http_signature_uses_public_url_behind_proxy(monkeypatch):
    public_url="https://pilot.example.com/voice/inbound"
    internal_url="http://127.0.0.1:8000/voice/inbound"
    params={"CallSid":"CA-test"}
    token="test-token"
    signature=RequestValidator(token).compute_signature(public_url,params)
    monkeypatch.setenv("PUBLIC_BASE_URL","https://pilot.example.com")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN",token)
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES","true")
    assert validate_twilio(internal_url,params,signature)


def test_twilio_websocket_signature_validates_final_url(monkeypatch):
    url="wss://pilot.example.com/voice/media-stream"
    token="test-token"
    signature=RequestValidator(token).compute_signature(url,{})
    monkeypatch.setenv("TWILIO_AUTH_TOKEN",token)
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES","true")
    assert validate_twilio_websocket(url,signature)
    https_signature=RequestValidator(token).compute_signature("https://pilot.example.com/voice/media-stream/",{})
    assert validate_twilio_websocket(url,https_signature)
    assert not validate_twilio_websocket(url,"bad")

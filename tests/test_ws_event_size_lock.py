from pathlib import Path

import ingress_security as sec


def test_websocket_event_cap_is_256_kib():
    assert sec.MAX_WEBSOCKET_EVENT_BYTES == 256 * 1024


def test_websocket_event_limit_counts_utf8_bytes():
    limit = sec.MAX_WEBSOCKET_EVENT_BYTES
    assert sec.websocket_event_within_limit("a" * limit) is True
    assert sec.websocket_event_within_limit("a" * (limit + 1)) is False
    assert sec.websocket_event_within_limit("") is True
    two_byte = "é" * (limit // 2)
    assert sec.websocket_event_within_limit(two_byte) is True
    assert sec.websocket_event_within_limit(two_byte + "é") is False
    assert sec.websocket_event_within_limit(b"a" * 10) is False
    assert sec.websocket_event_within_limit(None) is False
    assert sec.websocket_event_within_limit(10) is False


def test_voice_ingress_calls_event_limit():
    root = Path(__file__).resolve().parents[1]
    for name in ("voice_bridge.py", "gemini_voice.py"):
        text = (root / name).read_text(encoding="utf-8")
        assert "websocket_event_within_limit" in text

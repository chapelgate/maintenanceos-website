import inspect
import api
import gemini_voice
import voice_bridge

def test_normal_stream_exit_never_auto_dials_human(monkeypatch):
    monkeypatch.setenv('APP_SECRET', 's' * 32)
    xml = voice_bridge.inbound_stream_twiml(1, 'CA-test')
    assert '<Dial>' not in xml
    assert 'Thank you for calling Chapel Gate. Goodbye.' in xml
    assert 'call was interrupted' not in xml

def test_not_ready_api_does_not_auto_dial():
    source = inspect.getsource(api.voice_inbound)
    assert 'TWILIO_HUMAN_TRANSFER_NUMBER' not in source

def test_gemini_explicit_request_uses_live_transfer_update():
    source = inspect.getsource(gemini_voice.handle_gemini_media_stream)
    assert '_request_live_human_transfer' in source
    assert 'human_transfer_failed' in source
    assert 'call_sid' in source


def test_gemini_transfer_requires_finished_transcription():
    source = inspect.getsource(gemini_voice.handle_gemini_media_stream)
    assert 'getattr(input_tx, "finished", None) is True' in source
    assert source.index('finished') < source.index('_explicit_human_request(text)')

def test_transfer_twiml_is_only_in_explicit_helper():
    stream_source = inspect.getsource(voice_bridge.inbound_stream_twiml)
    helper_source = inspect.getsource(voice_bridge._request_live_human_transfer)
    assert '<Dial>' not in stream_source
    assert '<Dial>' in helper_source

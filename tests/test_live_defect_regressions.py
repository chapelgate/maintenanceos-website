import gemini_voice
import voice_bridge


def test_openai_prompt_is_uk_specific_and_forbids_911():
    prompt = voice_bridge.SYSTEM_PROMPT.casefold()
    assert "uk" in prompt or "british" in prompt
    assert "999" in prompt
    assert "never tell a uk caller to call 911" in prompt


def test_gemini_prompt_is_uk_specific_and_forbids_911():
    prompt = gemini_voice.SYSTEM_PROMPT.casefold()
    assert "uk" in prompt or "british" in prompt
    assert "999" in prompt
    assert "never say 911" in prompt


def test_transfer_remains_explicit_caller_request_only():
    positive = (
        "Please put me through to a person",
        "I want to speak to someone",
        "Please transfer me",
    )
    negative = (
        "The gate is dangerous",
        "I have a complaint",
        "This is urgent",
    )
    for text in positive:
        assert gemini_voice._explicit_human_request(text) is True
    for text in negative:
        assert gemini_voice._explicit_human_request(text) is False


def test_twilio_fallback_uses_uk_language_and_configurable_voice(monkeypatch):
    monkeypatch.delenv("TWILIO_TTS_LANGUAGE", raising=False)
    monkeypatch.delenv("TWILIO_TTS_VOICE", raising=False)
    assert voice_bridge.twilio_tts_language() == "en-GB"
    assert voice_bridge.twilio_tts_voice() == "Polly.Amy"


def test_transfer_path_does_not_inject_second_tts_voice():
    source = voice_bridge._request_live_human_transfer.__code__.co_consts
    joined = " ".join(value for value in source if isinstance(value, str)).casefold()
    assert "<dial>" in joined
    assert "<say" not in joined
    assert "nobody was available" not in joined

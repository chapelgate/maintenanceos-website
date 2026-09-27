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


def test_transfer_is_emergency_only_across_gemini_and_fallback():
    routine = (
        "Please put me through to a person",
        "I want to speak to someone",
        "Please transfer me",
        "I have a complaint",
        "This is urgent",
    )
    for text in routine:
        assert gemini_voice._emergency_transfer_requested(text) is False
        assert voice_bridge.requires_immediate_human_escalation(text)[0] is False

    assert gemini_voice._emergency_transfer_requested("This is an emergency") is True
    assert voice_bridge.requires_immediate_human_escalation(
        "There is a dog trapped in the alley gate"
    )[0] is True


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

import array

from gemini_voice import (
    _silence_duration_ms,
    gemini_pcm_to_twilio_mulaw,
    mulaw_to_pcm16,
    resample_pcm16,
    twilio_mulaw_to_gemini_pcm,
)


def test_silence_duration_env_bounds(monkeypatch):
    monkeypatch.setenv("GEMINI_SILENCE_DURATION_MS", "450")
    assert _silence_duration_ms() == 450
    monkeypatch.setenv("GEMINI_SILENCE_DURATION_MS", "50")
    assert _silence_duration_ms() == 200
    monkeypatch.setenv("GEMINI_SILENCE_DURATION_MS", "5000")
    assert _silence_duration_ms() == 1200


def test_hot_path_resamplers_preserve_energy():
    # 20ms of 8k µ-law silence/noise
    mulaw = bytes([0xFF, 0x7F] * 80)
    pcm16k = twilio_mulaw_to_gemini_pcm(mulaw)
    assert len(pcm16k) == len(mulaw_to_pcm16(mulaw)) * 2
    # 20ms of 24k pcm
    pcm24k = array.array("h", [1000, -1000, 500] * 160).tobytes()
    mulaw8k = gemini_pcm_to_twilio_mulaw(pcm24k)
    assert len(mulaw8k) == len(pcm24k) // 6
    # generic path still works
    out = resample_pcm16(pcm24k, 24000, 12000)
    assert len(out) == len(pcm24k) // 2


def test_transcription_merge_handles_cumulative_and_chunked_fragments():
    from gemini_voice import _merge_transcription

    assert _merge_transcription("", "Gate 943") == "Gate 943"
    assert _merge_transcription("Gate 943", "Gate 943 is broken") == "Gate 943 is broken"
    assert _merge_transcription("Gate 943 is", "broken") == "Gate 943 is broken"
    assert _merge_transcription("Gate 943 is broken", "broken") == "Gate 943 is broken"


def test_system_prompt_requires_polite_completed_call_farewell():
    from gemini_voice import SYSTEM_PROMPT

    assert "Thank you for calling Chapel Gate. Goodbye, have a nice day." in SYSTEM_PROMPT
    assert "Never end a completed routine call in silence." in SYSTEM_PROMPT

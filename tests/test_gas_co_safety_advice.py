import pytest

from decision_engine import classify
from safety_messages import GAS_SAFETY_ADVICE, CO_SAFETY_ADVICE
from voice_policy import validate_assistant_text, detect_action_claims
import gemini_voice
import voice_bridge


PROMPTS = [gemini_voice.SYSTEM_PROMPT, voice_bridge.SYSTEM_PROMPT]


@pytest.mark.parametrize("prompt", PROMPTS)
def test_prompts_embed_official_gas_and_co_advice(prompt):
    assert GAS_SAFETY_ADVICE in prompt
    assert CO_SAFETY_ADVICE in prompt
    assert "GAS AND CARBON MONOXIDE SAFETY RULE" in prompt
    assert "The caller must make the 0800 111 999 call themselves" in prompt


@pytest.mark.parametrize("prompt", PROMPTS)
def test_prompts_never_instruct_911(prompt):
    # 911 may appear only inside the prohibition
    for line in prompt.splitlines():
        if "911" in line:
            assert "Never" in line or "never" in line


def test_gas_advice_contains_official_steps():
    for phrase in (
        "0800 111 999",
        "Great Britain",
        "Don't smoke or strike matches",
        "Don't turn electrical switches on or off",
        "unless the meter is in a cellar or basement",
        "Keep people away from the area",
        "call 999",
    ):
        assert phrase in GAS_SAFETY_ADVICE
    assert "911" not in GAS_SAFETY_ADVICE


def test_co_advice_follows_nhs_and_national_gas():
    for phrase in (
        "0800 111 999",
        "get everyone outside",
        "hard to breathe",
        "call 999 now",
        "NHS 111",
        "don't go back in",
    ):
        assert phrase in CO_SAFETY_ADVICE


@pytest.mark.parametrize("advice", [GAS_SAFETY_ADVICE, CO_SAFETY_ADVICE])
def test_advice_passes_policy_gate_during_latched_case(advice):
    ok, reason = validate_assistant_text(advice, critical_active=True, verified_actions=set())
    assert ok, reason


@pytest.mark.parametrize("advice", [GAS_SAFETY_ADVICE, CO_SAFETY_ADVICE])
def test_advice_makes_no_action_claims(advice):
    assert detect_action_claims(advice) == set()


@pytest.mark.parametrize("text", [
    "I've contacted the National Gas Emergency Service for you.",
    "The gas emergency service has been notified.",
    "We've called the gas board and an engineer is on the way.",
])
def test_false_gas_service_contact_claims_are_rejected(text):
    ok, reason = validate_assistant_text(text, critical_active=True, verified_actions=set())
    assert not ok
    assert reason.startswith(("unverified_action_confirmation", "critical_safety_conflict"))


@pytest.mark.parametrize("text,expected", [
    ("I can smell gas in the kitchen", GAS_SAFETY_ADVICE),
    ("The carbon monoxide alarm is going off", CO_SAFETY_ADVICE),
])
def test_deterministic_path_selects_advice(text, expected):
    flags = classify(text)["safety_flags"]
    assert expected in voice_bridge.safety_advice_for_flags(flags)


def test_gas_and_co_together_gives_both():
    flags = classify("I smell gas and the CO alarm is beeping")["safety_flags"]
    advice = voice_bridge.safety_advice_for_flags(flags)
    assert GAS_SAFETY_ADVICE in advice and CO_SAFETY_ADVICE in advice


def test_non_gas_red_case_gets_no_gas_advice():
    flags = classify("The socket is sparking")["safety_flags"]
    assert voice_bridge.safety_advice_for_flags(flags) == ""


def test_deterministic_twiml_speaks_advice_and_never_911():
    flags = classify("There's a smell of gas by the meter")["safety_flags"]
    twiml = voice_bridge.deterministic_safety_twiml(flags)
    assert "0800 111 999" in twiml and "911" not in twiml
    assert "<Say" in twiml


def test_minimising_language_still_gets_gas_advice():
    flags = classify("I smell gas but it's probably nothing")["safety_flags"]
    assert GAS_SAFETY_ADVICE in voice_bridge.safety_advice_for_flags(flags)

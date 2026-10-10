"""Regression tests for the live call-handling rules ported from the production
voice host into canonical source (issue #147)."""
import re

import gemini_voice
from safety_messages import GAS_CO_SAFETY_RULE

PROMPT = gemini_voice.SYSTEM_PROMPT


def test_one_intake_field_per_turn():
    assert "collect exactly one intake field at a time" in PROMPT
    assert "Never request two or more repair details in the same turn" in PROMPT
    assert "Never combine any of steps 1 to 6 in one turn" in PROMPT


def test_alley_gate_intake_order_is_preserved():
    steps = [
        "1. Ask whether the gate is in Wirral or Sefton",
        "2. Ask for the gate number only",
        "3. Ask what is wrong with the gate only",
        "4. Ask for the caller's full name ONLY",
        "5. Ask for the caller's own full address including postcode ONLY",
        "6. Ask for the callback/contact telephone number ONLY",
    ]
    positions = [PROMPT.index(step) for step in steps]
    assert positions == sorted(positions)


def test_no_guess_rule_uses_only_caller_spoken_data():
    assert "CALL STATE / NO-GUESS RULE" in PROMPT
    assert "Treat only information actually spoken by the caller during THIS call as source data" in PROMPT
    assert "never repeat the rejected value" in PROMPT


def test_phone_accuracy_rule_forbids_digit_changes():
    assert "PHONE ACCURACY RULE" in PROMPT
    assert "Never prepend a zero, remove digits, insert digits, reorder digits" in PROMPT
    # The stricter canonical phone privacy rule is kept alongside it.
    assert "PHONE PRIVACY / ACCURACY RULE" in PROMPT


def test_fault_accuracy_rule_present():
    assert "FAULT ACCURACY RULE" in PROMPT
    assert "Do not convert an unclear phrase into a specific fault" in PROMPT


def test_canonical_readback_and_gas_co_rules_kept():
    assert "you MUST read back ALL collected job details" in PROMPT
    assert "'Is all of that correct?'" in PROMPT
    assert GAS_CO_SAFETY_RULE in PROMPT
    for line in PROMPT.splitlines():
        if "911" in line:
            assert re.search(r"\b[Nn]ever\b", line)

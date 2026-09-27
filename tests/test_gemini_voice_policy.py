from gemini_voice import (
    SYSTEM_PROMPT,
    _animal_welfare_emergency,
    _assistant_requested_field,
    _emergency_transfer_requested,
    _extract_clear_name,
    _extract_trusted_callback_digits,
    _routine_close_confirmed,
)


def test_repair_intake_collects_personal_details_one_at_a_time():
    assert "Ask for the caller's full name ONLY" in SYSTEM_PROMPT
    assert "full address including postcode ONLY" in SYSTEM_PROMPT
    assert "callback/contact telephone number ONLY" in SYSTEM_PROMPT


def test_phone_is_never_inferred_and_unclear_confirmation_does_not_close():
    assert "Never supply, infer, recall or guess a caller's telephone number" in SYSTEM_PROMPT
    assert "immediately preceding caller response is a clear affirmative confirmation" in SYSTEM_PROMPT
    assert "do not assume they are finished" in SYSTEM_PROMPT
    assert _routine_close_confirmed("That's it. Thank you.")
    assert not _routine_close_confirmed("répondre")
    assert not _routine_close_confirmed("zeigen wie sie meine kontaktnummer haben")


def test_transfer_remains_emergency_only():
    assert not _emergency_transfer_requested("speak to a person")
    assert not _emergency_transfer_requested("I want to pay cash")
    assert _emergency_transfer_requested("this is an emergency")


def test_cg34_runtime_guards():
    assert _animal_welfare_emergency("There is a dog stuck in the gate")
    assert _animal_welfare_emergency("A cat is trapped behind the gate")
    assert not _animal_welfare_emergency("The dog is in the garden")

    assert _extract_trusted_callback_digits("07752226746") == "07752226746"
    assert _extract_trusted_callback_digits("zero seven seven five two two six seven four six") == ""
    assert _extract_trusted_callback_digits("2755726746") == ""
    assert _extract_trusted_callback_digits("277") == ""
    assert _extract_trusted_callback_digits("five treble two six seven four six") == ""

    assert _extract_clear_name("Andrew Cartwright") == "Andrew Cartwright"
    assert _extract_clear_name("Andrew C A R T W R I G H T") == "Andrew Cartwright"
    assert _extract_clear_name("interest rate") == ""

    assert _assistant_requested_field("Could you repeat the correct telephone number?") == "phone"
    assert _assistant_requested_field("Could you tell me your correct full name?") == "name"
    assert _assistant_requested_field("Is all of that correct?") == "confirmation"

    assert "ANIMAL WELFARE EMERGENCY RULE" in SYSTEM_PROMPT
    assert "discard that field's previous value" in SYSTEM_PROMPT
    assert "spell the surname letter by letter" in SYSTEM_PROMPT

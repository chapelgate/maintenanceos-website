from gemini_voice import SYSTEM_PROMPT, _routine_close_confirmed, _emergency_transfer_requested


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

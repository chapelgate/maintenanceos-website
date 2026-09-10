from decision_engine import transition_allowed
def test_state_machine():
    assert transition_allowed("NEW","READY_FOR_DISPATCH")
    assert transition_allowed("READY_FOR_DISPATCH","AWAITING_CONTRACTOR")
    assert transition_allowed("AWAITING_CONTRACTOR","CONTRACTOR_ACCEPTED")
    assert transition_allowed("AWAITING_RESIDENT_CONFIRMATION","REOPENED")
    assert not transition_allowed("NEW","CLOSED")

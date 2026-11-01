from data_lifecycle import hold_scope_known, action_known


def test_known_hold_scopes():
    for scope in ("tenant", "record", "subject", "data_class"):
        assert hold_scope_known(scope) is True


def test_unknown_or_invalid_hold_scopes():
    assert hold_scope_known("") is False
    assert hold_scope_known("not_a_scope") is False
    assert hold_scope_known("tenant\x00") is False


def test_known_actions():
    for action in ("export", "erasure"):
        assert action_known(action) is True


def test_unknown_or_invalid_actions():
    assert action_known("") is False
    assert action_known("delete") is False
    assert action_known("export\x01") is False

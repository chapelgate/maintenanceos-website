import inspect

import approval_text
import channels
import decision_engine
import operations
import worker


def test_approval_text_exports_match_operations():
    assert approval_text.PROPOSED_ACTION_MAX == 1000
    assert operations.PROPOSED_ACTION_MAX == approval_text.PROPOSED_ACTION_MAX
    assert operations.bounded_proposed_action is approval_text.bounded_proposed_action


def test_decision_engine_approval_sites_use_helper():
    source = inspect.getsource(decision_engine)
    assert source.count("bounded_proposed_action(") >= 3
    for label in (
        "Human safety review",
        "Human review required",
        "Review uncertain classification",
    ):
        assert label in source


def test_channels_and_worker_approval_sites_use_helper():
    assert "bounded_proposed_action(" in inspect.getsource(channels)
    assert "Verify caller identity before property-specific action" in inspect.getsource(channels)
    assert "bounded_proposed_action(" in inspect.getsource(worker)
    assert "Select fallback contractor" in inspect.getsource(worker)

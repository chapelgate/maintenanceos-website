import inspect

import pytest

import operations


def test_proposed_action_max_is_1000():
    assert operations.PROPOSED_ACTION_MAX == 1000


def test_bounded_proposed_action_accepts_cap():
    value = "a" * operations.PROPOSED_ACTION_MAX
    assert operations.bounded_proposed_action(value) == value
    assert operations.bounded_proposed_action("  Dispatch job  ") == "Dispatch job"


def test_bounded_proposed_action_rejects_blank_and_overlong():
    for bad in ("", "   ", "a" * (operations.PROPOSED_ACTION_MAX + 1)):
        with pytest.raises(ValueError, match="proposed_action invalid"):
            operations.bounded_proposed_action(bad)


def test_operations_approval_sites_use_helper():
    source = inspect.getsource(operations)
    assert source.count("bounded_proposed_action(") >= 5
    for label in (
        "Dispatch job to",
        "Approve quote",
        "Review invoice",
        "Review failed/repeat repair",
        "Review reused completion evidence",
    ):
        assert label in source

import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import operations


def test_accept_action_key_max_is_200():
    assert operations.ACTION_KEY_MAX == 200
    source = inspect.getsource(operations.accept_contractor)
    assert "ACTION_KEY_MAX" in source


def test_accept_contractor_rejects_overlong_key():
    with pytest.raises(ValueError, match="Invalid action receipt key"):
        operations.accept_contractor(None, None, "a" * (operations.ACTION_KEY_MAX + 1))


def test_accept_contractor_accepts_valid_key():
    ops = operations
    source = inspect.getsource(ops.accept_contractor)
    assert "len(action_key) > ACTION_KEY_MAX" in source

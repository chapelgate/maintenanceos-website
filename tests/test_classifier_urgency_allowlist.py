import inspect
from unittest.mock import patch

import pytest

import decision_engine


def test_urgencies_known_set():
    assert decision_engine.URGENCIES == frozenset({"P1", "P2", "P3"})
    source = inspect.getsource(decision_engine.classify)
    assert "URGENCIES" in source
    assert "urgency is not allowed" in source


def test_classify_returns_allowed_urgency():
    assert decision_engine.classify("tap dripping")["urgency"] in decision_engine.URGENCIES
    assert decision_engine.classify("no heating in the flat")["urgency"] == "P2"
    assert decision_engine.classify("I smell gas")["urgency"] == "P1"


def test_classify_rejects_unknown_urgency():
    with patch.object(decision_engine, "URGENCIES", frozenset({"P9"})):
        with pytest.raises(ValueError, match="urgency is not allowed"):
            decision_engine.classify("tap dripping")

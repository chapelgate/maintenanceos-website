import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import idempotency as ide
from idempotency import claim_action
from models import Base


@pytest.fixture
def session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Testing = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with Testing() as s:
        yield s


def test_claim_action_rejects_del_in_scope(session):
    with pytest.raises(ValueError, match="scope_control_chars"):
        claim_action(session, "bad\x7fscope", "key-1")


def test_claim_action_rejects_c1_in_action_key(session):
    with pytest.raises(ValueError, match="action_key_control_chars"):
        claim_action(session, "dispatch", "key\x80bad")


def test_claim_action_accepts_clean(session):
    receipt, created = claim_action(session, "dispatch", "key-clean-1279")
    assert created is True
    assert receipt.action_key == "key-clean-1279"


def test_set_result_ref_rejects_del_and_c1():
    receipt = MagicMock()
    with pytest.raises(ValueError, match="control"):
        ide.set_result_ref(receipt, "result\x7fvalue")
    with pytest.raises(ValueError, match="control"):
        ide.set_result_ref(receipt, "result\x9fvalue")


def test_set_ai_side_effects_rejects_del_actor_and_c1_reason():
    session = MagicMock()
    session.get.return_value = None
    with pytest.raises(ValueError, match="actor control"):
        ide.set_ai_side_effects(session, True, actor="ops\x7flead", reason="enable")
    with pytest.raises(ValueError, match="reason control"):
        ide.set_ai_side_effects(session, True, actor="ops", reason="enable\x85now")

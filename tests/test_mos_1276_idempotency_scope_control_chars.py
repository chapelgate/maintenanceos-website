import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from idempotency import claim_action
from models import Base


@pytest.fixture
def session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Testing = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with Testing() as s:
        yield s


def test_claim_action_rejects_control_chars_in_scope(session):
    with pytest.raises(ValueError, match="scope_control_chars"):
        claim_action(session, "bad\x00scope", "key-1")


def test_claim_action_accepts_clean_scope(session):
    receipt, created = claim_action(session, "dispatch", "key-clean")
    assert created is True
    assert receipt.scope == "dispatch"

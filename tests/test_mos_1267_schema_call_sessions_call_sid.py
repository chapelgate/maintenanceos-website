from sqlalchemy import create_engine

from models import Base
from schema_health import REQUIRED_UNIQUES, schema_report


def test_required_uniques_include_call_sessions_call_sid():
    assert "call_sessions" in REQUIRED_UNIQUES
    assert ("call_sid",) in REQUIRED_UNIQUES["call_sessions"]


def test_schema_report_compatible_with_call_sessions_call_sid():
    eng = create_engine("sqlite://")
    Base.metadata.create_all(eng)
    result = schema_report(eng)
    assert result["database_reachable"] is True
    assert "call_sessions" not in result["missing_unique_constraints"]
    assert result["schema_compatible"] is True

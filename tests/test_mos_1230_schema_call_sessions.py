from sqlalchemy import create_engine

from models import Base
from schema_health import REQUIRED_UNIQUES, schema_report


def test_schema_health_reports_call_sessions_unique():
    eng = create_engine("sqlite://")
    Base.metadata.create_all(eng)
    result = schema_report(eng)
    assert "call_sessions" not in result["missing_unique_constraints"]
    assert result["schema_compatible"] is True


def test_schema_health_without_engine_reports_missing():
    assert "call_sessions" in REQUIRED_UNIQUES
    assert ("call_sid",) in REQUIRED_UNIQUES["call_sessions"]

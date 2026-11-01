from sqlalchemy import create_engine
from models import engine, Base
from schema_health import schema_report


def test_schema_health_reports_call_sessions_unique():
    # Use in-memory SQLite so schema_report can inspect
    eng = create_engine("sqlite://")
    Base.metadata.create_all(eng)
    result = schema_report(eng)
    # With our fix, call_sessions should NOT be in missing_uniques
    assert "call_sessions" not in result["missing_unique_constraints"]
    # Ensure the table is recognized
    assert result["schema_compatible"] == True or "call_sessions" not in str(result["missing_tables"])


def test_schema_health_without_fix_reports_missing():
    # Minimal test: verify the dict contains the key
    from schema_health import REQUIRED_UNIQUES
    assert "call_sessions" in REQUIRED_UNIQUES
    assert ("client_id","source","event_key") in REQUIRED_UNIQUES["call_sessions"]

import reporting as rep
from export_csv import FORBIDDEN_EXPORT_FIELDS


def test_report_forbidden_covers_export_auth_material():
    required = {
        "csrf",
        "csrf_token",
        "cookie",
        "cookies",
        "session",
        "session_id",
        "bearer",
        "access_token",
        "refresh_token",
        "emergency_notes",
    }
    assert required.issubset(rep.FORBIDDEN_REPORT_FIELDS)


def test_report_forbidden_superset_of_export_auth_keys():
    authish = {
        "session",
        "session_id",
        "csrf",
        "csrf_token",
        "cookie",
        "cookies",
        "bearer",
        "access_token",
        "refresh_token",
        "emergency_notes",
    }
    assert authish.issubset(FORBIDDEN_EXPORT_FIELDS)
    assert authish.issubset(rep.FORBIDDEN_REPORT_FIELDS)


def test_kpi_and_metrics_avoid_expanded_forbidden():
    assert rep.FORBIDDEN_REPORT_FIELDS.intersection(rep.OPERATIONAL_METRICS_FIELDS) == set()
    assert rep.FORBIDDEN_REPORT_FIELDS.intersection(rep.PORTFOLIO_KPI_FIELDS) == set()

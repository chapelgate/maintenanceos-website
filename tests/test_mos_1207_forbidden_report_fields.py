import reporting as rep


def test_forbidden_report_fields_include_session_csrf_shapes():
    required = {
        "csrf_token",
        "cookie",
        "session",
        "session_id",
        "bearer",
        "password",
        "token",
        "authorization",
    }
    assert required.issubset(rep.FORBIDDEN_REPORT_FIELDS)


def test_operational_metrics_fields_avoid_forbidden_keys():
    overlap = rep.FORBIDDEN_REPORT_FIELDS.intersection(rep.OPERATIONAL_METRICS_FIELDS)
    assert not overlap


def test_portfolio_kpi_fields_avoid_forbidden_keys():
    overlap = rep.FORBIDDEN_REPORT_FIELDS.intersection(rep.PORTFOLIO_KPI_FIELDS)
    assert not overlap

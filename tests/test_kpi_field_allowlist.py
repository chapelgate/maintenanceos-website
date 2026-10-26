from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import reporting
from models import Base, Client


def test_portfolio_kpi_fields_are_exact_allowlist():
    assert reporting.PORTFOLIO_KPI_FIELDS == (
        "total_jobs",
        "open_jobs",
        "closed_jobs",
        "p1_jobs",
        "repeat_repairs",
        "open_sla_breaches",
        "avg_close_hours",
    )
    assert reporting.FORBIDDEN_REPORT_FIELDS.intersection(reporting.PORTFOLIO_KPI_FIELDS) == set()


def test_operational_metrics_fields_are_exact_allowlist():
    assert reporting.OPERATIONAL_METRICS_FIELDS == (
        "requests",
        "urgency_distribution",
        "avg_minutes_to_triage",
        "avg_minutes_to_contractor_acceptance",
        "avg_minutes_to_appointment",
        "avg_minutes_to_completion_submission",
        "overdue_open_jobs",
        "repeat_repairs",
        "human_intervention_rate",
        "human_minutes_per_work_order",
        "human_minutes_measurement_available",
        "automation_completed",
        "automation_failed",
        "safety_escalations",
        "open_escalations",
        "avg_approval_turnaround_minutes",
        "unresolved_exceptions",
        "data_scope",
    )
    assert reporting.FORBIDDEN_REPORT_FIELDS.intersection(reporting.OPERATIONAL_METRICS_FIELDS) == set()


def test_portfolio_kpis_returns_only_allowlisted_keys(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)
    with TestingSession() as session:
        session.add(Client(name="Synthetic KPI Tenant"))
        session.commit()
        client_id = session.query(Client).one().id
    monkeypatch.setattr(reporting, "SessionLocal", TestingSession)
    body = reporting.portfolio_kpis(client_id)
    assert set(body) == set(reporting.PORTFOLIO_KPI_FIELDS)
    metrics = reporting.operational_metrics(client_id)
    assert set(metrics) == set(reporting.OPERATIONAL_METRICS_FIELDS)
    assert metrics["data_scope"] == "tenant_recorded_data"

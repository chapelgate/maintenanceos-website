import csv
from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import export_csv
import operations
import reporting
from idempotency import claim_action
from models import (
    ActionReceipt,
    Base,
    Client,
    CompletionEvidence,
    Contractor,
    Property,
    WorkOrder,
)
from tenant_security import TenantAccessError
from voice_policy import authorize_model_action


def _database(monkeypatch):
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (export_csv, operations, reporting):
        monkeypatch.setattr(module, "SessionLocal", factory)
    return factory


def _seed_two_tenants(factory):
    with factory() as session:
        clients = [Client(name="Tenant A"), Client(name="Tenant B")]
        session.add_all(clients)
        session.flush()
        records = []
        for client, suffix in zip(clients, ("A", "B")):
            prop = Property(client_id=client.id, address=f"Private {suffix}", postcode="SW1A 1AA")
            contractor = Contractor(
                client_id=client.id,
                name=f"Contractor {suffix}",
                trade="Plumber",
                active=True,
                qualification_summary="SYNTHETIC TEST",
                qualification_expiry="2099-12-31",
                insurance_expiry="2099-12-31",
            )
            session.add_all([prop, contractor])
            session.flush()
            work_order = WorkOrder(
                client_id=client.id,
                property_id=prop.id,
                source="TEST",
                description=f"Issue {suffix}",
                category="Plumbing",
                trade="Plumber",
                urgency="P3",
                status="IN_PROGRESS",
                assigned_contractor_id=contractor.id,
                ai_confidence=.9,
            )
            session.add(work_order)
            session.flush()
            records.append((client.id, contractor.id, work_order.id))
        session.commit()
        return records


def test_identical_action_keys_are_isolated_by_tenant(monkeypatch):
    factory = _database(monkeypatch)
    (client_a, _, work_order_a), (client_b, _, work_order_b) = _seed_two_tenants(factory)
    with factory() as session:
        _, first_a = claim_action(
            session, "MODEL_TOOL_CALL", "same-key", client_id=client_a, work_order_id=work_order_a
        )
        _, first_b = claim_action(
            session, "MODEL_TOOL_CALL", "same-key", client_id=client_b, work_order_id=work_order_b
        )
        session.commit()
        assert first_a and first_b
        assert session.query(ActionReceipt).filter_by(scope="MODEL_TOOL_CALL", action_key="same-key").count() == 2


def test_model_tool_idempotency_is_tenant_scoped(monkeypatch):
    factory = _database(monkeypatch)
    (_, _, work_order_a), (_, _, work_order_b) = _seed_two_tenants(factory)
    with factory() as session:
        assert authorize_model_action(session, work_order_a, "record_intake", "same-call-key")[0]
        assert authorize_model_action(session, work_order_b, "record_intake", "same-call-key")[0]
        assert not authorize_model_action(session, work_order_a, "record_intake", "same-call-key")[0]


def test_model_tool_without_work_order_requires_explicit_tenant(monkeypatch):
    factory = _database(monkeypatch)
    (client_a, _, _), (client_b, _, _) = _seed_two_tenants(factory)
    with factory() as session:
        assert authorize_model_action(session, None, "record_intake", "unbound") == (
            False,
            "tenant_context_required",
        )
        assert authorize_model_action(
            session, None, "record_intake", "tenant-call", client_id=client_a
        )[0]
        assert authorize_model_action(
            session, None, "record_intake", "tenant-call", client_id=client_b
        )[0]
        assert authorize_model_action(
            session, None, "record_intake", "tenant-call", client_id=client_a
        ) == (False, "duplicate_model_action")


def test_model_tool_rejects_missing_key_and_work_order_tenant_mismatch(monkeypatch):
    factory = _database(monkeypatch)
    (client_a, _, work_order_a), (client_b, _, _) = _seed_two_tenants(factory)
    with factory() as session:
        assert authorize_model_action(
            session, work_order_a, "record_intake", "", client_id=client_a
        ) == (False, "idempotency_key_required")
        assert authorize_model_action(
            session, work_order_a, "record_intake", "wrong-tenant", client_id=client_b
        ) == (False, "tenant_mismatch")


def test_work_order_export_requires_and_filters_tenant(monkeypatch, tmp_path):
    factory = _database(monkeypatch)
    (client_a, _, work_order_a), (client_b, _, _) = _seed_two_tenants(factory)
    output = tmp_path / "tenant-a.csv"
    export_csv.export_work_orders(client_a, output)
    with output.open(newline="", encoding="utf-8") as stream:
        rows = list(csv.DictReader(stream))
    assert [int(row["id"]) for row in rows] == [work_order_a]
    assert {int(row["client_id"]) for row in rows} == {client_a}
    assert client_b not in {int(row["client_id"]) for row in rows}


def test_contractor_scorecard_rejects_other_tenant_and_filters_jobs(monkeypatch):
    factory = _database(monkeypatch)
    (client_a, contractor_a, work_order_a), (client_b, _, _) = _seed_two_tenants(factory)
    with factory() as session:
        session.add(CompletionEvidence(
            work_order_id=work_order_a,
            contractor_id=contractor_a,
            completion_note="Synthetic completion",
            evidence_url="synthetic://evidence",
        ))
        session.commit()
    assert reporting.contractor_scorecard(client_b, contractor_a) is None
    scorecard = reporting.contractor_scorecard(client_a, contractor_a)
    assert scorecard["jobs_assigned"] == 1
    assert scorecard["completions"] == 1


def test_unassigned_same_tenant_contractor_cannot_submit_consequential_records(monkeypatch):
    factory = _database(monkeypatch)
    (client_id, assigned_id, work_order_id), _ = _seed_two_tenants(factory)
    with factory() as session:
        other = Contractor(
            client_id=client_id,
            name="Unassigned contractor",
            trade="Plumber",
            active=True,
            qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",
        )
        session.add(other)
        session.commit()
        other_id = other.id

    with pytest.raises(TenantAccessError):
        operations.submit_quote(work_order_id, other_id, 10, "No")
    with pytest.raises(TenantAccessError):
        operations.submit_availability(
            work_order_id,
            other_id,
            datetime.utcnow() + timedelta(hours=1),
            datetime.utcnow() + timedelta(hours=2),
            "unassigned-availability",
        )
    with pytest.raises(TenantAccessError):
        operations.submit_completion(
            work_order_id, other_id, "Not assigned", "synthetic://unassigned", "unassigned-complete"
        )
    with factory() as session:
        assert session.get(WorkOrder, work_order_id).assigned_contractor_id == assigned_id
        assert session.query(CompletionEvidence).filter_by(work_order_id=work_order_id).count() == 0

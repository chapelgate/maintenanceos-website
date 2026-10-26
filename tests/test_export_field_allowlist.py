import csv
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import export_csv
from models import Base, Client, Property, WorkOrder


def test_export_fields_are_exact_allowlist():
    assert export_csv.EXPORT_WORK_ORDER_FIELDS == (
        "id",
        "client_id",
        "property_id",
        "resident_id",
        "source",
        "category",
        "trade",
        "urgency",
        "status",
        "assigned_contractor_id",
        "repeat_repair",
        "created_at",
        "updated_at",
        "closed_at",
        "description",
    )
    overlap = export_csv.FORBIDDEN_EXPORT_FIELDS.intersection(export_csv.EXPORT_WORK_ORDER_FIELDS)
    assert overlap == set()


def test_export_rejects_non_positive_client_id(tmp_path):
    with pytest.raises(ValueError, match="client_id"):
        export_csv.export_work_orders(0, str(tmp_path / "out.csv"))
    with pytest.raises(ValueError, match="client_id"):
        export_csv.export_work_orders(-1, str(tmp_path / "out.csv"))


def test_export_writes_only_allowlisted_headers(monkeypatch, tmp_path):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    session_factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(export_csv, "SessionLocal", session_factory)
    with session_factory() as session:
        client = Client(name="SYNTHETIC EXPORT TENANT")
        session.add(client)
        session.flush()
        prop = Property(
            client_id=client.id,
            address="SYNTHETIC TEST PROPERTY",
            postcode="ZZ1 1ZZ",
        )
        session.add(prop)
        session.flush()
        session.add(
            WorkOrder(
                client_id=client.id,
                property_id=prop.id,
                description="synthetic leak",
            )
        )
        session.commit()
        client_id = client.id
    path = tmp_path / "work_orders_export.csv"
    result = export_csv.export_work_orders(client_id, str(path))
    assert Path(result).is_file()
    with open(result, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        assert reader.fieldnames == list(export_csv.EXPORT_WORK_ORDER_FIELDS)
        for name in export_csv.FORBIDDEN_EXPORT_FIELDS:
            assert name not in reader.fieldnames
        rows = list(reader)
        assert len(rows) == 1
        assert rows[0]["description"] == "synthetic leak"
        assert rows[0]["client_id"] == str(client_id)

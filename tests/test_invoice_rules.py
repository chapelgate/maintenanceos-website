import json

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import operations
from models import Approval,Base,Client,CompletionEvidence,Contractor,Invoice,InvoiceIdentity,Property,WorkOrder


@pytest.fixture
def invoice_db(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    factory=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    monkeypatch.setattr(operations,"SessionLocal",factory)
    with factory() as session:
        client=Client(name="Synthetic invoice tenant",invoice_variance_percent=10)
        session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Test",postcode="SW1A 1AA")
        contractor=Contractor(
            client_id=client.id,name="Contractor",trade="Plumber",active=True,
            postcode_coverage="SW1A",qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31",insurance_expiry="2099-12-31",
        )
        session.add_all([prop,contractor]);session.flush()
        work_orders=[]
        for description in ("first","second"):
            wo=WorkOrder(client_id=client.id,property_id=prop.id,description=description,status="AWAITING_INVOICE",category="Plumbing",trade="Plumber",ai_confidence=.9,assigned_contractor_id=contractor.id)
            session.add(wo);session.flush();work_orders.append(wo.id)
            session.add(CompletionEvidence(work_order_id=wo.id,contractor_id=contractor.id,completion_note="done",evidence_url=f"https://evidence/{wo.id}"))
        session.commit()
        return factory,client.id,contractor.id,work_orders


def test_at28_duplicate_invoice_number_is_normalised_and_sent_to_review(invoice_db):
    factory,client_id,contractor_id,work_orders=invoice_db
    first=operations.invoice_qa(work_orders[0],contractor_id," INV-001 ",100,"first")
    second=operations.invoice_qa(work_orders[1],contractor_id,"inv-001",100,"replayed")
    with factory() as session:
        original=session.get(Invoice,first);duplicate=session.get(Invoice,second)
        assert original.status=="READY_FOR_CLIENT"
        assert duplicate.status=="HUMAN_REVIEW"
        assert "duplicate_invoice_number" in json.loads(duplicate.anomaly_reasons)
        assert session.query(InvoiceIdentity).filter_by(client_id=client_id,contractor_id=contractor_id,normalised_invoice_number="inv-001").count()==1
        assert session.query(Approval).filter_by(work_order_id=work_orders[1],approval_type="INVOICE",status="PENDING").count()==1


def test_at28_database_uniqueness_rejects_duplicate_invoice_identity(invoice_db):
    factory,client_id,contractor_id,_=invoice_db
    with factory() as session:
        session.add_all([
            InvoiceIdentity(client_id=client_id,contractor_id=contractor_id,normalised_invoice_number="inv-race"),
            InvoiceIdentity(client_id=client_id,contractor_id=contractor_id,normalised_invoice_number="inv-race"),
        ])
        with pytest.raises(IntegrityError):session.commit()

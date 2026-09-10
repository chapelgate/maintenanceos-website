import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from communications import queue_outbound,record_delivery_status
from models import Base,Client,Communication,CommunicationDelivery,Escalation,Property,WorkOrder


def _seed():
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    factory=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    with factory() as session:
        client=Client(name="Synthetic communications tenant");session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Synthetic",postcode="ZZ1 1ZZ");session.add(prop);session.flush()
        work_order=WorkOrder(client_id=client.id,property_id=prop.id,description="Tap",status="APPOINTMENT_BOOKED")
        session.add(work_order);session.commit();return factory,client.id,work_order.id


def test_queued_message_is_idempotent_and_not_claimed_sent():
    factory,client_id,work_order_id=_seed()
    with factory() as session:
        first=queue_outbound(
            session,client_id=client_id,work_order_id=work_order_id,channel="EMAIL",
            recipient="synthetic@example.test",body="Reminder",action_key="reminder-1",
        )
        session.commit();first_id=first.id
    with factory() as session:
        second=queue_outbound(
            session,client_id=client_id,work_order_id=work_order_id,channel="EMAIL",
            recipient="synthetic@example.test",body="Reminder",action_key="reminder-1",
        )
        session.commit()
        assert second.id==first_id
        assert session.query(CommunicationDelivery).count()==1
        communication=session.get(Communication,second.communication_id)
        assert second.status=="QUEUED" and communication.direction=="OUTBOUND_PENDING"
        assert communication.participant.startswith("sha256:") and "@" not in communication.participant


def test_attempt_sent_delivered_are_distinct_verified_states():
    factory,client_id,work_order_id=_seed()
    with factory() as session:
        delivery=queue_outbound(
            session,client_id=client_id,work_order_id=work_order_id,channel="SMS",
            recipient="+440000000001",body="Update",action_key="update-1",
        );session.flush();delivery_id=delivery.id
        assert record_delivery_status(session,delivery_id,"ATTEMPTED")
        assert not record_delivery_status(session,delivery_id,"SENT")
        assert record_delivery_status(session,delivery_id,"SENT",provider_reference="synthetic-provider-id")
        assert record_delivery_status(session,delivery_id,"DELIVERED",provider_reference="synthetic-delivery-id")
        assert not record_delivery_status(session,delivery_id,"FAILED",failure_code="late-failure")
        session.commit()
    with factory() as session:
        delivery=session.get(CommunicationDelivery,delivery_id)
        assert delivery.status=="DELIVERED" and delivery.attempts==1
        assert session.get(Communication,delivery.communication_id).direction=="OUTBOUND_DELIVERED"


def test_failed_delivery_never_becomes_sent_and_escalates():
    factory,client_id,work_order_id=_seed()
    with factory() as session:
        delivery=queue_outbound(
            session,client_id=client_id,work_order_id=work_order_id,channel="WHATSAPP",
            recipient="+440000000001",body="Update",action_key="update-failed",
        );session.flush();delivery_id=delivery.id
        assert record_delivery_status(session,delivery_id,"ATTEMPTED")
        assert record_delivery_status(session,delivery_id,"FAILED",failure_code="synthetic-timeout")
        assert not record_delivery_status(session,delivery_id,"SENT",provider_reference="impossible")
        session.commit()
    with factory() as session:
        assert session.get(CommunicationDelivery,delivery_id).status=="FAILED"
        assert session.query(Escalation).filter_by(work_order_id=work_order_id,level="SYSTEM").count()==1


def test_cross_tenant_queue_is_rejected():
    factory,_client_id,work_order_id=_seed()
    with factory() as session:
        other=Client(name="Other tenant");session.add(other);session.commit()
        with pytest.raises(ValueError,match="outside"):
            queue_outbound(
                session,client_id=other.id,work_order_id=work_order_id,channel="EMAIL",
                recipient="other@example.test",body="No",action_key="cross-tenant",
            )

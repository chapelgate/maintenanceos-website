import hashlib
import json
from datetime import datetime
from clock import utcnow
FAILURE_CODE_MAX = 100
PROVIDER_REFERENCE_MAX = 200
RECIPIENT_MAX = 100


from sqlalchemy.exc import IntegrityError

from models import AuditEvent, Communication, CommunicationDelivery, Escalation, WorkOrder


DELIVERY_STATES = {"QUEUED", "ATTEMPTED", "SENT", "DELIVERED", "FAILED"}
DELIVERY_TRANSITIONS = {
    "QUEUED": {"ATTEMPTED", "SENT", "DELIVERED", "FAILED"},
    "ATTEMPTED": {"SENT", "DELIVERED", "FAILED"},
    "SENT": {"DELIVERED", "FAILED"},
    "DELIVERED": set(),
    "FAILED": set(),
}
CHANNELS = {"EMAIL", "SMS", "WHATSAPP", "VOICE"}
COMMUNICATION_BODY_MAX = 10000
ACTION_KEY_MAX = 200
RECIPIENT_MAX = 320
FAILURE_CODE_MAX = 100
PROVIDER_REFERENCE_MAX = 200


def _hash_recipient(value: str) -> str:
    return "sha256:" + hashlib.sha256((value or "").strip().casefold().encode()).hexdigest()


def _has_control_chars(value: str, *, allow_whitespace_controls: bool = False) -> bool:
    allowed = {"\t", "\n", "\r"} if allow_whitespace_controls else set()
    return any(
        (ord(ch) < 32 and ch not in allowed)
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def queue_outbound(
    session,
    *,
    client_id: int,
    work_order_id: int,
    channel: str,
    recipient: str,
    body: str,
    action_key: str,
) -> CommunicationDelivery:
    channel=(channel or "").strip().upper();body=body if isinstance(body,str) else ""
    action_key=(action_key or "").strip();recipient=(recipient or "").strip()
    if channel not in CHANNELS or not action_key or not recipient or not body.strip() or len(body)>COMMUNICATION_BODY_MAX or len(action_key)>ACTION_KEY_MAX or len(recipient)>RECIPIENT_MAX:
        raise ValueError("Invalid outbound communication")
    if _has_control_chars(recipient) or _has_control_chars(action_key) or _has_control_chars(body, allow_whitespace_controls=True):
        raise ValueError("Outbound communication control characters")
    work_order=session.get(WorkOrder,work_order_id)
    if not work_order or work_order.client_id!=client_id:
        raise ValueError("Outbound communication is outside the authorised tenant")
    existing=session.query(CommunicationDelivery).filter_by(
        client_id=client_id,channel=channel,action_key=action_key
    ).first()
    if existing:return existing
    try:
        with session.begin_nested():
            communication=Communication(
                work_order_id=work_order_id,channel=channel,direction="OUTBOUND_PENDING",
                participant=_hash_recipient(recipient),body=body,
            )
            session.add(communication);session.flush()
            delivery=CommunicationDelivery(
                client_id=client_id,work_order_id=work_order_id,communication_id=communication.id,
                channel=channel,action_key=action_key,status="QUEUED",
            )
            session.add(delivery);session.flush()
    except IntegrityError:
        existing=session.query(CommunicationDelivery).filter_by(
            client_id=client_id,channel=channel,action_key=action_key
        ).first()
        if not existing:raise
        return existing
    session.add(AuditEvent(
        work_order_id=work_order_id,actor="Communication Queue",event="COMMUNICATION_QUEUED",
        detail=json.dumps({"channel":channel,"action_key":action_key},sort_keys=True),
    ))
    return delivery


def _has_control_chars(value: str, *, allow_whitespace_controls: bool = False) -> bool:
    allowed = {"\t", "\n", "\r"} if allow_whitespace_controls else set()
    return any(
        (ord(ch) < 32 and ch not in allowed)
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def record_delivery_status(
    session,
    delivery_id: int,
    status: str,
    *,
    provider_reference: str="",
    failure_code: str="",
) -> bool:
    delivery=session.get(CommunicationDelivery,delivery_id)
    status=(status or "").strip().upper()
    if not delivery or status not in DELIVERY_STATES:return False
    if status==delivery.status:return True
    if status not in DELIVERY_TRANSITIONS.get(delivery.status,set()):return False
    provider_reference=(provider_reference or "").strip();failure_code=(failure_code or "").strip()
    if len(provider_reference) > PROVIDER_REFERENCE_MAX:return False
    if len(failure_code) > FAILURE_CODE_MAX:return False
    if _has_control_chars(provider_reference) or _has_control_chars(failure_code):
        return False
    if status in {"SENT","DELIVERED"} and not provider_reference:return False
    if status=="FAILED" and not failure_code:return False
    delivery.status=status;delivery.updated_at=utcnow()
    delivery.provider_reference=provider_reference or delivery.provider_reference
    delivery.failure_code=failure_code
    if status=="ATTEMPTED":delivery.attempts+=1
    communication=session.get(Communication,delivery.communication_id)
    if communication:communication.direction=f"OUTBOUND_{status}"
    session.add(AuditEvent(
        work_order_id=delivery.work_order_id,actor="Communication Gateway",event="COMMUNICATION_STATUS",
        detail=json.dumps({
            "delivery_id":delivery.id,"status":status,
            "provider_reference":delivery.provider_reference,"failure_code":failure_code,
        },sort_keys=True),
    ))
    if status=="FAILED":
        exists=session.query(Escalation).filter_by(
            work_order_id=delivery.work_order_id,level="SYSTEM",status="OPEN"
        ).first()
        if not exists:
            session.add(Escalation(
                work_order_id=delivery.work_order_id,level="SYSTEM",
                reason="Outbound communication failed and requires human review",
            ))
    return True

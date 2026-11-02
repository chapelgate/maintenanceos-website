import hashlib
import json
import re
from datetime import datetime
from clock import utcnow
from sqlalchemy.exc import IntegrityError
from models import *
from phone_normalise import normalise_phone
from decision_engine import apply_intake_rules
from lifecycle import transition_work_order
from approval_text import bounded_approval_reason, bounded_proposed_action
from operations import select_contractor,create_dispatch_approval
from tenant_security import require_client_resource,resident_by_phone_for_client
EVENT_KEY_MAX = 200
CHANNEL_SOURCE_MAX = 30
INCIDENT_KEY_MAX = 200
MEDIA_URL_MAX = 2000
MEDIA_URL_MAX = 2000
CHANNEL_DESCRIPTION_MAX = 8000


EMAIL_LOOKUP_MAX = 320
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def resident_by_email(client_id,email):
    email=(email or "").strip()
    if not email or len(email) > EMAIL_LOOKUP_MAX:
        return None
    if any(
        (ord(ch) < 32 and ch not in "\t\n\r")
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in email
    ):
        return None
    if not EMAIL_RE.match(email):
        return None
    with SessionLocal() as s:
        r=s.query(Resident).filter_by(client_id=client_id,email=email,active=True).first()
        return r.id if r else None

def resident_by_phone(phone,client_id=None):
    if client_id is None:
        return None
    target=normalise_phone(phone)
    if not target:return None
    with SessionLocal() as s:
        resident=resident_by_phone_for_client(s,client_id,target)
        return resident.id if resident else None

def _enforce_identity_review(work_order_id,identity_verified):
    with SessionLocal() as s:
        wo=s.get(WorkOrder,work_order_id)
        if not wo:return
        existing=s.query(Approval).filter_by(work_order_id=work_order_id,approval_type="IDENTITY",status="PENDING").first()
        if identity_verified and not existing:return
        transition_work_order(s,wo,"HUMAN_REVIEW",actor="Identity Gate",reason="Caller identity is not verified")
        if not existing:
            s.add(Approval(client_id=wo.client_id,work_order_id=work_order_id,approval_type="IDENTITY",
                           proposed_action=bounded_proposed_action("Verify caller identity before property-specific action"),
                           reason=bounded_approval_reason("Inbound caller has not completed second-factor verification")))
        s.add(AuditEvent(work_order_id=work_order_id,actor="Identity Gate",event="IDENTITY_REVIEW_REQUIRED",
                         detail="No property-specific information or dispatch permitted"))
        s.commit()

def _finish_intake(work_order_id,identity_verified):
    apply_intake_rules(work_order_id)
    _enforce_identity_review(work_order_id,identity_verified)
    cid=select_contractor(work_order_id)
    if cid:create_dispatch_approval(work_order_id)

def _has_control_chars(value: str) -> bool:
    return any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def canonical_incident_key(client_id,property_id,resident_id,description):
    if _has_control_chars(description or ""):
        raise ValueError("control characters not allowed")
    caller_lines=[]
    for line in (description or "").splitlines():
        if line.lower().startswith("caller") and ":" in line:
            caller_lines.append(line.split(":",1)[1])
    text=" ".join(caller_lines) if caller_lines else (description or "")
    normalised=re.sub(r"[^a-z0-9]+"," ",text.lower()).strip()
    digest=hashlib.sha256(normalised.encode()).hexdigest()
    return f"daily:{utcnow().date().isoformat()}:{client_id}:{property_id}:{resident_id or 0}:{digest}"


PARTICIPANT_MAX = 320


def create_from_channel(client_id,property_id,resident_id,source,description,participant="",media_url="",identity_verified=True,incident_key=None,event_key=None):
    for val in (description, participant, media_url or "", event_key or "", incident_key or ""):
        if _has_control_chars(val):
            raise ValueError("control characters not allowed")
    participant = "" if participant is None else str(participant)
    if len(participant) > PARTICIPANT_MAX:
        raise ValueError("participant is too long")
    incident_key=(incident_key or canonical_incident_key(client_id,property_id,resident_id,description)).strip()
    event_key=(event_key or "").strip()
    if len(event_key) > EVENT_KEY_MAX:
        raise ValueError("event_key is too long")
    if len(source) > CHANNEL_SOURCE_MAX:
        raise ValueError("source is too long")
    if incident_key and len(incident_key) > INCIDENT_KEY_MAX:
        raise ValueError("incident_key is too long")
    if media_url and len(media_url) > MEDIA_URL_MAX:
        raise ValueError("media_url is too long")
    if not description or not description.strip() or len(description) > CHANNEL_DESCRIPTION_MAX:
        raise ValueError("description is invalid")
    with SessionLocal() as s:
        require_client_resource(s,client_id,property_id=property_id,resident_id=resident_id)
        if event_key:
            event=s.query(ChannelEventIdentity).filter_by(client_id=client_id,source=source,event_key=event_key).first()
            if event:return event.work_order_id
        existing=s.query(IncidentIdentity).filter_by(client_id=client_id,incident_key=incident_key).first()
        if existing:
            wo=s.get(WorkOrder,existing.work_order_id)
            if description and description not in wo.description:
                combined=(wo.description+"\n"+description).strip()
                if len(combined) > CHANNEL_DESCRIPTION_MAX:
                    raise ValueError("description is invalid")
            if event_key:s.add(ChannelEventIdentity(client_id=client_id,source=source,event_key=event_key,work_order_id=wo.id))
            s.add(Communication(work_order_id=wo.id,channel=source,direction="INBOUND",participant=participant,body=description,media_url=media_url))
            if description and description not in wo.description:
                wo.description=(wo.description+"\n"+description).strip()
            try:s.commit();wid=wo.id
            except IntegrityError:
                s.rollback()
                event=s.query(ChannelEventIdentity).filter_by(client_id=client_id,source=source,event_key=event_key).first() if event_key else None
                if event:return event.work_order_id
                raise
            _finish_intake(wid,identity_verified)
            return wid
        wo=WorkOrder(client_id=client_id,property_id=property_id,resident_id=resident_id,
                     source=source,description=description)
        s.add(wo);s.flush()
        s.add(IncidentIdentity(client_id=client_id,incident_key=incident_key,work_order_id=wo.id))
        if event_key:s.add(ChannelEventIdentity(client_id=client_id,source=source,event_key=event_key,work_order_id=wo.id))
        s.add(Communication(work_order_id=wo.id,channel=source,direction="INBOUND",
                            participant=participant,body=description,media_url=media_url))
        try:
            s.commit();wid=wo.id
        except IntegrityError:
            s.rollback()
            existing=s.query(IncidentIdentity).filter_by(client_id=client_id,incident_key=incident_key).first()
            if not existing:
                raise
            return existing.work_order_id
    _finish_intake(wid,identity_verified)
    return wid

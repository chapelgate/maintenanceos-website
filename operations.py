import hashlib
import json
import math
import os
import re
from datetime import date,datetime,timedelta
from clock import utcnow
from sqlalchemy.exc import IntegrityError
from models import *
from decision_engine import contractor_rank,transition_allowed,work_order_allows_dispatch
from lifecycle import transition_work_order
from security import app_secret_ready,contractor_link_expires_at,sign_link
from idempotency import ACTION_KEY_MAX, claim_action, set_result_ref
from safety_controls import SafetyStateError,critical_safety_active,require_noncritical
from tenant_security import TenantAccessError,require_client_resource
from audit_text import redact_detail
from request_context import request_id as current_request_id
APPROVAL_REASON_MAX = 1000
CANCEL_REASON_MAX = 1000
ESCALATION_RESOLUTION_MAX = 1000
NO_SHOW_REASON_MAX = 1000
REJECT_REASON_MAX = 1000
REOPEN_REASON_MAX = 1000
AUDIT_ACTOR_MAX = 100
AUDIT_EVENT_MAX = 100
COMPLETION_FINGERPRINT_LEN = 64


def audit(s, woid, actor, event, detail=""):
    actor = (actor or "").strip()
    event = (event or "").strip()
    if not actor or len(actor) > AUDIT_ACTOR_MAX:
        raise ValueError("audit actor invalid")
    if not event or len(event) > AUDIT_EVENT_MAX:
        raise ValueError("audit event invalid")
    detail = redact_detail(detail or "")
    rid = current_request_id()
    if rid:
        try:
            payload = json.loads(detail) if detail else {}
            if isinstance(payload, dict):
                payload.setdefault("request_id", rid)
                detail = json.dumps(payload, sort_keys=True)
        except (json.JSONDecodeError, TypeError):
            pass
    s.add(AuditEvent(work_order_id=woid, actor=actor, event=event, detail=detail))


BLOCKING_REVIEW_TYPES={
    "SAFETY","POST_SAFETY_CLEARANCE","IDENTITY","HUMAN_ESCALATION",
    "TRIAGE","REPEAT_REPAIR","EVIDENCE_REUSE","CONTRACTOR_TIMEOUT",
}
APPROVAL_ROLES={
    "DISPATCH":{"admin","manager","dispatcher"},
    "QUOTE":{"admin","manager"},
    "INVOICE":{"admin","manager","finance"},
    "POST_SAFETY_CLEARANCE":{"admin","manager"},
    "IDENTITY":{"admin","manager"},
    "TRIAGE":{"admin","manager"},
    "HUMAN_ESCALATION":{"admin","manager","safety_manager"},
    "REPEAT_REPAIR":{"admin","manager"},
    "EVIDENCE_REUSE":{"admin","manager"},
    "CONTRACTOR_TIMEOUT":{"admin","manager","dispatcher"},
}
LIFECYCLE_ROLES={"admin","manager"}
REASON_REQUIRED_APPROVALS={
    "POST_SAFETY_CLEARANCE","IDENTITY","TRIAGE","HUMAN_ESCALATION",
    "REPEAT_REPAIR","EVIDENCE_REUSE","CONTRACTOR_TIMEOUT",
}
REVIEW_TARGETS={
    "IDENTITY":"READY_FOR_DISPATCH",
    "REPEAT_REPAIR":"READY_FOR_DISPATCH",
    "EVIDENCE_REUSE":"AWAITING_RESIDENT_CONFIRMATION",
    "CONTRACTOR_TIMEOUT":"READY_FOR_DISPATCH",
}

INCIDENT_LINK_KEY_MAX = 200

def incident_link(kind: str, work_order_id: int | None = None, subject_id: int = 0, expires_at: int | None = None) -> str | None:
    """Create an incident link token for observability."""
    try:
        from security import SIGNED_LINK_KINDS, sign_link
        if kind not in SIGNED_LINK_KINDS:
            return None
        if work_order_id is None:
            return None
        return sign_link(kind, work_order_id, subject_id, expires_at)
    except (ImportError, ValueError):
        # security module not fully initialized; degrade gracefully
        return None


def _valid_expiry(value,on_date=None):
    try:return date.fromisoformat((value or "").strip()) >= (on_date or date.today())
    except (TypeError,ValueError):return False


def contractor_is_eligible(contractor,on_date=None):
    return bool(
        contractor
        and contractor.active
        and (contractor.qualification_summary or "").strip()
        and _valid_expiry(contractor.qualification_expiry,on_date)
        and _valid_expiry(contractor.insurance_expiry,on_date)
    )


def contractor_covers_postcode(contractor,postcode):
    target="".join((postcode or "").upper().split())
    prefixes=["".join(item.upper().split()) for item in re.split(r"[,;\s]+",contractor.postcode_coverage or "") if item.strip()]
    return bool(target and any(target.startswith(prefix) for prefix in prefixes))


def _has_blocking_review(s,work_order_id):
    return bool(s.query(Approval).filter(
        Approval.work_order_id==work_order_id,
        Approval.status=="PENDING",
        Approval.approval_type.in_(BLOCKING_REVIEW_TYPES),
    ).first())


def _authorised_user(s,user_id,client_id,roles):
    user=s.get(User,user_id)
    return user if user and user.active and user.client_id==client_id and user.role in roles else None

def select_contractor(work_order_id):
    with SessionLocal() as s:
        wo=s.query(WorkOrder).filter_by(id=work_order_id).first()
        if not wo or critical_safety_active(s,work_order_id) or not work_order_allows_dispatch(wo):return None
        prop=s.query(Property).filter_by(id=wo.property_id).first()
        if not prop or prop.client_id!=wo.client_id:return None
        if _has_blocking_review(s,wo.id):return None
        excluded={row.contractor_id for row in s.query(ContractorAttempt).filter(
            ContractorAttempt.work_order_id==wo.id,
            ContractorAttempt.status.in_(["DECLINED","TIMED_OUT"]),
        ).all()}
        contractors=[
            c for c in s.query(Contractor).filter_by(client_id=wo.client_id).all()
            if contractor_is_eligible(c) and contractor_covers_postcode(c,prop.postcode) and c.id not in excluded
        ]
        ranked=contractor_rank(contractors,wo.trade,prop.postcode)
        if not ranked:return None
        wo.assigned_contractor_id=ranked[0].id
        audit(s,wo.id,"Contractor Agent","CONTRACTOR_RECOMMENDED",ranked[0].name)
        s.commit()
        return ranked[0].id

def create_dispatch_approval(work_order_id):
    with SessionLocal() as s:
        wo=s.query(WorkOrder).filter_by(id=work_order_id).first()
        if not wo or critical_safety_active(s,work_order_id) or not work_order_allows_dispatch(wo) or not wo.assigned_contractor_id:return None
        c=s.query(Contractor).filter_by(id=wo.assigned_contractor_id,client_id=wo.client_id).first()
        if not contractor_is_eligible(c) or _has_blocking_review(s,wo.id):return None
        existing=s.query(Approval).filter_by(work_order_id=wo.id,approval_type="DISPATCH",status="PENDING").first()
        if existing:return existing.id
        receipt,fresh=claim_action(s,"DISPATCH_APPROVAL",str(wo.id),client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:
            return int(receipt.result_ref) if receipt.result_ref else None
        a=Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="DISPATCH",
                   proposed_action=f"Dispatch job to {c.name}",reason=f"Best ranked approved {wo.trade}")
        s.add(a);s.flush();receipt.result_ref=str(a.id);s.commit();return a.id

def contractor_portal_links(work_order_id):
    if os.getenv("ENABLE_CONTRACTOR_PORTAL", "false").strip().lower() != "true":
        return {}
    with SessionLocal() as s:
        wo=s.query(WorkOrder).filter_by(id=work_order_id).first()
        if not wo or wo.status!="AWAITING_CONTRACTOR" or not app_secret_ready() or critical_safety_active(s,work_order_id):return {}
        try:
            flags=json.loads(wo.safety_flags or "[]")
        except (TypeError,json.JSONDecodeError):
            return {}
        if flags:return {}
        if _has_blocking_review(s,wo.id):return {}
        cid=wo.assigned_contractor_id
        if not cid:return {}
        if not contractor_is_eligible(s.query(Contractor).filter_by(id=cid,client_id=wo.client_id).first()):return {}
        approved=s.query(Approval).filter_by(work_order_id=wo.id,approval_type="DISPATCH",status="APPROVED").first()
        if not approved:return {}
    base=os.getenv("PUBLIC_BASE_URL","http://127.0.0.1:8000").rstrip("/")
    expires_at=contractor_link_expires_at()
    return {
      "accept":f"{base}/contractor/decision?work_order_id={work_order_id}&contractor_id={cid}&decision=accept&token={sign_link('accept',work_order_id,cid,expires_at)}",
      "decline":f"{base}/contractor/decision?work_order_id={work_order_id}&contractor_id={cid}&decision=decline&token={sign_link('decline',work_order_id,cid,expires_at)}",
      "availability":f"{base}/contractor/availability?work_order_id={work_order_id}&contractor_id={cid}&token={sign_link('availability',work_order_id,cid,expires_at)}",
      "complete":f"{base}/contractor/complete?work_order_id={work_order_id}&contractor_id={cid}&token={sign_link('complete',work_order_id,cid,expires_at)}"
    }

def book_slot(work_order_id,availability_id):
    with SessionLocal() as s:
        try: wo=require_noncritical(s,work_order_id,"Appointment booking")
        except SafetyStateError: return None
        av=s.query(ContractorAvailability).filter_by(id=availability_id,work_order_id=work_order_id).first()
        if not wo or not av or wo.status not in {"CONTRACTOR_ACCEPTED","AWAITING_AVAILABILITY"}:return None
        require_client_resource(s,wo.client_id,work_order_id=wo.id,contractor_id=av.contractor_id)
        contractor=s.query(Contractor).filter_by(id=av.contractor_id,client_id=wo.client_id).first()
        if not contractor_is_eligible(contractor) or _has_blocking_review(s,wo.id):return None
        receipt,fresh=claim_action(s,"BOOK_AVAILABILITY",str(availability_id),client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:return int(receipt.result_ref) if receipt.result_ref else None
        ap=Appointment(work_order_id=wo.id,contractor_id=av.contractor_id,start_at=av.slot_start,end_at=av.slot_end,status="BOOKED")
        s.add(ap);s.flush();receipt.result_ref=str(ap.id)
        transition_work_order(s,wo,"APPOINTMENT_BOOKED",actor="Scheduler",reason="Resident/contractor slot selected")
        s.add(AutomationJob(work_order_id=wo.id,job_type="APPOINTMENT_REMINDER",
                            run_at=max(utcnow(),av.slot_start-timedelta(hours=1)),payload=json.dumps({"appointment":"reminder"})))
        audit(s,wo.id,"Scheduler","APPOINTMENT_BOOKED",av.slot_start.isoformat())
        s.commit();return ap.id

def submit_quote(work_order_id,contractor_id,amount,description):
    with SessionLocal() as s:
        if not math.isfinite(amount) or amount<=0:return None
        wo=require_noncritical(s,work_order_id,"Quote submission")
        require_client_resource(s,wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
        if wo.assigned_contractor_id != contractor_id:return None
        if wo.status not in {"CONTRACTOR_ACCEPTED","AWAITING_AVAILABILITY","APPOINTMENT_BOOKED","IN_PROGRESS"}:return None
        client=s.query(Client).filter_by(id=wo.client_id).first()
        q=Quote(work_order_id=wo.id,contractor_id=contractor_id,amount=amount,description=description)
        s.add(q);s.flush()
        if amount>client.quote_approval_limit:
            s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="QUOTE",
                           proposed_action=f"Approve quote £{amount:.2f}",reason=description,amount=amount))
            transition_work_order(s,wo,"HUMAN_REVIEW",actor="Quote Engine",reason="Quote exceeds client authority")
        else:
            q.status="AUTO_WITHIN_LIMIT"
        audit(s,wo.id,"Quote Engine","QUOTE_RECEIVED",f"£{amount:.2f}")
        s.commit();return q.id

def invoice_qa(work_order_id,contractor_id,invoice_number,amount,description):
    with SessionLocal() as s:
        if not (invoice_number or "").strip() or not math.isfinite(amount):return None
        wo=require_noncritical(s,work_order_id,"Invoice processing")
        require_client_resource(s,wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
        if wo.assigned_contractor_id != contractor_id:return None
        if wo.status!="AWAITING_INVOICE":return None
        client=s.query(Client).filter_by(id=wo.client_id).first()
        reasons=[];score=0
        normalised="".join((invoice_number or "").lower().split())
        identity=s.query(InvoiceIdentity).filter_by(client_id=wo.client_id,contractor_id=contractor_id,normalised_invoice_number=normalised).first()
        duplicate=identity is not None
        if not identity:
            identity=InvoiceIdentity(client_id=wo.client_id,contractor_id=contractor_id,normalised_invoice_number=normalised)
            try:
                with s.begin_nested():
                    s.add(identity);s.flush()
            except IntegrityError:
                identity=s.query(InvoiceIdentity).filter_by(client_id=wo.client_id,contractor_id=contractor_id,normalised_invoice_number=normalised).first()
                if not identity: raise
                duplicate=True
        if duplicate: reasons.append("duplicate_invoice_number");score+=.6
        q=s.query(Quote).filter_by(work_order_id=work_order_id,contractor_id=contractor_id).order_by(Quote.id.desc()).first()
        if q and q.amount>0:
            variance=((amount-q.amount)/q.amount)*100
            if variance>client.invoice_variance_percent:
                reasons.append(f"invoice_above_quote_by_{variance:.1f}_percent");score+=.35
        if not s.query(CompletionEvidence).filter_by(work_order_id=work_order_id).first():
            reasons.append("no_completion_evidence");score+=.25
        if amount<=0:
            reasons.append("invalid_amount");score=1
        score=min(score,1)
        inv=Invoice(work_order_id=work_order_id,contractor_id=contractor_id,invoice_number=invoice_number,
                    amount=amount,description=description,anomaly_score=score,anomaly_reasons=json.dumps(reasons),
                    status="HUMAN_REVIEW" if score>=.25 else "READY_FOR_CLIENT")
        s.add(inv);s.flush()
        if identity.first_invoice_id is None:identity.first_invoice_id=inv.id
        if score>=.25:
            s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="INVOICE",
                           proposed_action=f"Review invoice {invoice_number} £{amount:.2f}",reason=json.dumps(reasons),amount=amount))
            transition_work_order(s,wo,"HUMAN_REVIEW",actor="Invoice QA",reason="Invoice anomaly requires review")
        else:
            transition_work_order(s,wo,"READY_TO_CLOSE",actor="Invoice QA",reason="Invoice checks passed")
        audit(s,wo.id,"Invoice QA","INVOICE_CHECKED",json.dumps({"score":score,"reasons":reasons}))
        s.commit();return inv.id

def resident_confirmation(work_order_id,resolved,comment=""):
    with SessionLocal() as s:
        wo=require_noncritical(s,work_order_id,"Resident confirmation")
        if wo.status!="AWAITING_RESIDENT_CONFIRMATION":return False
        s.add(ResidentConfirmation(work_order_id=wo.id,resolved=resolved,comment=comment))
        if resolved:transition_work_order(s,wo,"AWAITING_INVOICE",actor="Resident Confirmation",reason="Resident reported repair resolved")
        else:
            transition_work_order(s,wo,"REOPENED",actor="Resident Confirmation",reason="Resident reported repair unresolved",flush=True);wo.repeat_repair=True
            s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="REPEAT_REPAIR",
                           proposed_action="Review failed/repeat repair",reason=comment or "Resident says unresolved"))
            transition_work_order(s,wo,"HUMAN_REVIEW",actor="Resident Confirmation",reason="Repeat repair requires human review")
        audit(s,wo.id,"Resident Confirmation","RESOLUTION_RECORDED",str(resolved))
        s.commit();return True

def accept_contractor(work_order_id,contractor_id,action_key):
    action_key=(action_key or "").strip()
    if not action_key or len(action_key) > ACTION_KEY_MAX:return False
    with SessionLocal() as s:
        try: wo=require_noncritical(s,work_order_id,"Contractor acceptance")
        except SafetyStateError:return False
        require_client_resource(s,wo.client_id,work_order_id=work_order_id,contractor_id=contractor_id)
        contractor=s.query(Contractor).filter_by(id=contractor_id,client_id=wo.client_id).first()
        if not contractor_is_eligible(contractor) or _has_blocking_review(s,wo.id):return False
        approved=s.query(Approval).filter_by(work_order_id=work_order_id,approval_type="DISPATCH",status="APPROVED").first()
        if not approved:return False
        _,fresh=claim_action(s,"CONTRACTOR_ACCEPT",action_key,client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:return False
        if wo.status!="AWAITING_CONTRACTOR":s.rollback();return False
        try:
            with s.begin_nested():
                s.add(ContractorAcceptance(work_order_id=wo.id,contractor_id=contractor_id,action_key=action_key))
                s.flush()
        except IntegrityError:
            s.rollback();return False
        transition_work_order(s,wo,"CONTRACTOR_ACCEPTED",actor="Contractor",reason="Contractor accepted approved dispatch")
        attempt=s.query(ContractorAttempt).filter_by(work_order_id=wo.id,contractor_id=contractor_id).first()
        if not attempt:
            attempt=ContractorAttempt(client_id=wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
            s.add(attempt)
        attempt.status="ACCEPTED";attempt.responded_at=utcnow()
        s.add(AutomationJob(work_order_id=wo.id,job_type="AVAILABILITY_CHECK",run_at=utcnow(),payload="{}"))
        audit(s,wo.id,"Contractor","CONTRACTOR_ACCEPT",str(contractor_id));s.commit();return True


def decline_contractor(work_order_id,contractor_id,action_key):
    action_key=(action_key or "").strip()
    if not action_key or len(action_key) > ACTION_KEY_MAX:return False
    with SessionLocal() as s:
        try:wo=require_noncritical(s,work_order_id,"Contractor decline")
        except SafetyStateError:return False
        require_client_resource(s,wo.client_id,work_order_id=work_order_id,contractor_id=contractor_id)
        if wo.status!="AWAITING_CONTRACTOR" or wo.assigned_contractor_id!=contractor_id:return False
        _,fresh=claim_action(s,"CONTRACTOR_DECLINE",action_key,client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:return False
        attempt=s.query(ContractorAttempt).filter_by(work_order_id=wo.id,contractor_id=contractor_id).first()
        if not attempt:
            attempt=ContractorAttempt(client_id=wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
            s.add(attempt)
        attempt.status="DECLINED";attempt.responded_at=utcnow()
        transition_work_order(s,wo,"READY_FOR_DISPATCH",actor="Contractor",reason="Contractor declined approved dispatch")
        wo.assigned_contractor_id=None
        audit(s,wo.id,"Contractor","CONTRACTOR_DECLINE",str(contractor_id))
        s.commit();return True

def submit_availability(work_order_id,contractor_id,start,end,action_key):
    with SessionLocal() as s:
        wo=require_noncritical(s,work_order_id,"Availability submission")
        require_client_resource(s,wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
        if wo.assigned_contractor_id != contractor_id:return None
        if end<=start:return None
        if not contractor_is_eligible(s.query(Contractor).filter_by(id=contractor_id,client_id=wo.client_id).first()):return None
        if wo.status not in {"CONTRACTOR_ACCEPTED","AWAITING_AVAILABILITY"}:return None
        receipt,fresh=claim_action(s,"CONTRACTOR_AVAILABILITY",action_key,client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:return int(receipt.result_ref) if receipt.result_ref else None
        av=ContractorAvailability(work_order_id=work_order_id,contractor_id=contractor_id,slot_start=start,slot_end=end)
        s.add(av);s.flush();receipt.result_ref=str(av.id)
        transition_work_order(s,wo,"AWAITING_AVAILABILITY",actor="Contractor",reason="Availability submitted")
        audit(s,wo.id,"Contractor","AVAILABILITY_SUBMITTED",f"{start.isoformat()} - {end.isoformat()}")
        s.commit();return av.id


def completion_evidence_fingerprint(note: str, evidence_url: str = "") -> str:
    material = (evidence_url or note or "").encode()
    digest = hashlib.sha256(material).hexdigest()
    if len(digest) != COMPLETION_FINGERPRINT_LEN:
        raise ValueError("completion fingerprint length invalid")
    return digest

def submit_completion(work_order_id,contractor_id,note,evidence_url,action_key):
    with SessionLocal() as s:
        if not (note or "").strip():return None
        wo=require_noncritical(s,work_order_id,"Completion submission")
        require_client_resource(s,wo.client_id,work_order_id=wo.id,contractor_id=contractor_id)
        if wo.assigned_contractor_id != contractor_id:return None
        if wo.status not in {"APPOINTMENT_BOOKED","IN_PROGRESS","AWAITING_COMPLETION_EVIDENCE"}:return None
        receipt,fresh=claim_action(s,"CONTRACTOR_COMPLETION",action_key,client_id=wo.client_id,work_order_id=wo.id)
        if not fresh:return int(receipt.result_ref) if receipt.result_ref else None
        fingerprint=completion_evidence_fingerprint(note, evidence_url)
        reused=s.get(EvidenceIdentity,fingerprint)
        evidence=CompletionEvidence(work_order_id=work_order_id,contractor_id=contractor_id,completion_note=note,evidence_url=evidence_url)
        s.add(evidence);s.flush();set_result_ref(receipt, evidence.id)
        if wo.status=="APPOINTMENT_BOOKED":
            transition_work_order(s,wo,"IN_PROGRESS",actor="Contractor",reason="Contractor reports work started",flush=True)
        if wo.status=="IN_PROGRESS":
            transition_work_order(s,wo,"AWAITING_COMPLETION_EVIDENCE",actor="Contractor",reason="Completion evidence submitted",flush=True)
        if reused and reused.first_work_order_id!=work_order_id:
            transition_work_order(s,wo,"HUMAN_REVIEW",actor="Evidence Gate",reason="Completion evidence was reused")
            s.add(Approval(client_id=wo.client_id,work_order_id=wo.id,approval_type="EVIDENCE_REUSE",
                           proposed_action="Review reused completion evidence",reason=f"Previously used for work order {reused.first_work_order_id}"))
        else:
            if not reused:s.add(EvidenceIdentity(fingerprint=fingerprint,first_work_order_id=work_order_id,first_contractor_id=contractor_id))
            transition_work_order(s,wo,"AWAITING_RESIDENT_CONFIRMATION",actor="Evidence Gate",reason="Completion evidence recorded")
        wo.updated_at=utcnow();audit(s,wo.id,"Contractor","COMPLETION_SUBMITTED",note)
        s.commit();return evidence.id


def confirm_appointment(work_order_id,resident_id,event_key):
    event_key=(event_key or "").strip()
    if not event_key or len(event_key) > ACTION_KEY_MAX:return False
    with SessionLocal() as s:
        wo=require_noncritical(s,work_order_id,"Appointment confirmation")
        require_client_resource(s,wo.client_id,work_order_id=wo.id,resident_id=resident_id)
        if wo.resident_id!=resident_id or wo.status!="APPOINTMENT_BOOKED":return False
        appointment=s.query(Appointment).filter_by(
            work_order_id=wo.id,status="BOOKED"
        ).order_by(Appointment.id.desc()).first()
        if not appointment:return False
        receipt,fresh=claim_action(
            s,"RESIDENT_APPOINTMENT_CONFIRMATION",event_key,
            client_id=wo.client_id,work_order_id=wo.id,
        )
        if not fresh:return appointment.resident_confirmed
        appointment.resident_confirmed=True;receipt.result_ref=str(appointment.id)
        audit(s,wo.id,"Resident Confirmation","APPOINTMENT_CONFIRMED",str(appointment.id))
        s.commit();return True


def approve_operational_action(approval_id,actor_user_id,reason=""):
    reason=(reason or "").strip()
    if len(reason) > APPROVAL_REASON_MAX:
        return False
    with SessionLocal() as s:
        approval=s.get(Approval,approval_id)
        if not approval or approval.status!="PENDING" or approval.approval_type not in APPROVAL_ROLES:return False
        user=_authorised_user(s,actor_user_id,approval.client_id,APPROVAL_ROLES[approval.approval_type])
        if not user:return False
        if approval.approval_type in REASON_REQUIRED_APPROVALS and len(reason)<5:return False
        try:require_noncritical(s,approval.work_order_id,"Approval")
        except SafetyStateError:return False
        work_order=s.get(WorkOrder,approval.work_order_id)
        if approval.approval_type=="DISPATCH":
            contractor=s.get(Contractor,work_order.assigned_contractor_id) if work_order.assigned_contractor_id else None
            if work_order.status!="READY_FOR_DISPATCH" or not contractor_is_eligible(contractor):return False
            prop=s.get(Property,work_order.property_id)
            if not prop or not contractor_covers_postcode(contractor,prop.postcode):return False
            attempt=s.query(ContractorAttempt).filter_by(
                work_order_id=work_order.id,contractor_id=contractor.id
            ).first()
            if attempt and attempt.status in {"DECLINED","TIMED_OUT"}:return False
            if not attempt:
                s.add(ContractorAttempt(
                    client_id=work_order.client_id,work_order_id=work_order.id,
                    contractor_id=contractor.id,status="OFFERED",
                ))
            transition_work_order(s,work_order,"AWAITING_CONTRACTOR",actor=f"User:{user.id}",reason="Dispatch approved")
            receipt,fresh=claim_action(s,"CONTRACTOR_RESPONSE_TIMER",str(work_order.id),client_id=work_order.client_id,work_order_id=work_order.id)
            if fresh:
                job=AutomationJob(work_order_id=work_order.id,job_type="CONTRACTOR_RESPONSE_CHECK",run_at=utcnow(),payload="{}")
                s.add(job);s.flush();receipt.result_ref=str(job.id)
        elif approval.approval_type=="QUOTE":
            quote=s.query(Quote).filter_by(work_order_id=work_order.id,amount=approval.amount).order_by(Quote.id.desc()).first()
            if not quote or work_order.status!="HUMAN_REVIEW":return False
            quote.status="APPROVED"
            transition_work_order(s,work_order,"IN_PROGRESS",actor=f"User:{user.id}",reason="Quote approved")
        elif approval.approval_type=="INVOICE":
            invoice=s.query(Invoice).filter_by(work_order_id=work_order.id,status="HUMAN_REVIEW").order_by(Invoice.id.desc()).first()
            if not invoice or work_order.status!="HUMAN_REVIEW":return False
            invoice.status="APPROVED_FOR_CLIENT"
            transition_work_order(s,work_order,"READY_TO_CLOSE",actor=f"User:{user.id}",reason="Invoice approved")
        elif approval.approval_type=="POST_SAFETY_CLEARANCE":
            state=s.get(CriticalSafetyState,work_order.id)
            if not state or state.active or work_order.status!="HUMAN_REVIEW":return False
            approval.status="APPROVED";approval.decided_at=utcnow()
            other_hold=_has_blocking_review(s,work_order.id)
            if not other_hold:
                transition_work_order(s,work_order,"READY_FOR_DISPATCH",actor=f"User:{user.id}",reason=reason)
        elif approval.approval_type=="TRIAGE":
            return False
        elif approval.approval_type in set(REVIEW_TARGETS) | {"HUMAN_ESCALATION"}:
            if work_order.status!="HUMAN_REVIEW":return False
            approval.status="APPROVED";approval.decided_at=utcnow()
            target=REVIEW_TARGETS.get(approval.approval_type)
            if target and not _has_blocking_review(s,work_order.id):
                transition_work_order(s,work_order,target,actor=f"User:{user.id}",reason=reason)
        approval.status="APPROVED";approval.decided_at=utcnow()
        audit(s,approval.work_order_id,f"User:{user.id}","APPROVAL_APPROVED",json.dumps({"type":approval.approval_type,"reason":reason}))
        s.commit();return True


TRIAGE_URGENCIES = frozenset({"P2", "P3"})
TRIAGE_REASON_MAX = 1000
TRIAGE_CATEGORIES = frozenset({
    "Plumbing","Heating","Electrical","Drainage","Roofing",
    "Locks / access","Doors","Windows","Appliances","Damp / mould",
    "Pests","Structural","Fire safety","General maintenance"
})


def resolve_triage(approval_id,actor_user_id,category,trade,urgency,reason):
    reason=(reason or "").strip();category=(category or "").strip();trade=(trade or "").strip()
    if len(reason)<5 or not category or category not in TRIAGE_CATEGORIES or not trade or urgency not in TRIAGE_URGENCIES:return False
    if DECISION_TRADE.get(category) != trade:return False
    if len(reason) > TRIAGE_REASON_MAX:return False
    with SessionLocal() as s:
        approval=s.get(Approval,approval_id)
        if not approval or approval.status!="PENDING" or approval.approval_type!="TRIAGE":return False
        user=_authorised_user(s,actor_user_id,approval.client_id,APPROVAL_ROLES["TRIAGE"])
        if not user:return False
        try:work_order=require_noncritical(s,approval.work_order_id,"Triage resolution")
        except SafetyStateError:return False
        if work_order.status!="HUMAN_REVIEW":return False
        work_order.category=category;work_order.trade=trade;work_order.urgency=urgency;work_order.ai_confidence=1.0
        approval.status="APPROVED";approval.decided_at=utcnow()
        if not _has_blocking_review(s,work_order.id):
            transition_work_order(s,work_order,"READY_FOR_DISPATCH",actor=f"User:{user.id}",reason=reason)
        audit(s,work_order.id,f"User:{user.id}","TRIAGE_RESOLVED",json.dumps({"category":category,"trade":trade,"urgency":urgency,"reason":reason}))
        s.commit();return True


def reject_operational_action(approval_id,actor_user_id,reason):
    reason=(reason or "").strip()
    if len(reason)<5:return False
    if len(reason) > REJECT_REASON_MAX:
        return False
    with SessionLocal() as s:
        approval=s.get(Approval,approval_id)
        roles=APPROVAL_ROLES.get(approval.approval_type,set()) if approval else set()
        user=_authorised_user(s,actor_user_id,approval.client_id,roles) if approval else None
        if not approval or approval.status!="PENDING" or not user:return False
        approval.status="REJECTED";approval.decided_at=utcnow()
        audit(s,approval.work_order_id,f"User:{user.id}","APPROVAL_REJECTED",json.dumps({"type":approval.approval_type,"reason":reason}))
        s.commit();return True


def cancel_work_order(work_order_id,actor_user_id,reason):
    reason=(reason or "").strip()
    if len(reason)<5:return False
    if len(reason) > CANCEL_REASON_MAX:
        return False
    with SessionLocal() as s:
        try:wo=require_noncritical(s,work_order_id,"Cancellation")
        except SafetyStateError:return False
        user=_authorised_user(s,actor_user_id,wo.client_id,LIFECYCLE_ROLES)
        if not user:return False
        for appointment in s.query(Appointment).filter_by(work_order_id=wo.id,status="BOOKED").all():
            appointment.status="CANCELLED"
            audit(s,wo.id,f"User:{user.id}","APPOINTMENT_CANCELLED",json.dumps({"appointment_id":appointment.id,"reason":reason}))
        try:transition_work_order(s,wo,"CANCELLED",actor=f"User:{user.id}",reason=reason)
        except WorkOrderStateError:return False
        s.commit();return True


def reopen_work_order(work_order_id,actor_user_id,reason):
    reason=(reason or "").strip()
    if len(reason)<5:return False
    if len(reason) > REOPEN_REASON_MAX:
        return False
    with SessionLocal() as s:
        try:wo=require_noncritical(s,work_order_id,"Reopening")
        except SafetyStateError:return False
        user=_authorised_user(s,actor_user_id,wo.client_id,LIFECYCLE_ROLES)
        if not user:return False
        try:transition_work_order(s,wo,"REOPENED",actor=f"User:{user.id}",reason=reason)
        except WorkOrderStateError:return False
        wo.repeat_repair=True
        s.commit();return True


def record_no_show(work_order_id,actor_user_id,reason):
    reason=(reason or "").strip()
    if len(reason)<5:return False
    if len(reason) > NO_SHOW_REASON_MAX:
        return False
    with SessionLocal() as s:
        try:wo=require_noncritical(s,work_order_id,"No-show recording")
        except SafetyStateError:return False
        user=_authorised_user(s,actor_user_id,wo.client_id,LIFECYCLE_ROLES)
        if not user or wo.status!="APPOINTMENT_BOOKED":return False
        appointment=s.query(Appointment).filter_by(work_order_id=wo.id,status="BOOKED").order_by(Appointment.id.desc()).first()
        if not appointment:return False
        appointment.status="NO_SHOW"
        transition_work_order(s,wo,"NO_SHOW",actor=f"User:{user.id}",reason=reason)
        s.commit();return True

def close_work_order(work_order_id,actor_user_id):
    with SessionLocal() as s:
        wo=require_noncritical(s,work_order_id,"Work-order closure")
        user=s.get(User,actor_user_id)
        if not user or not user.active or user.client_id!=wo.client_id:return False
        if wo.status!="READY_TO_CLOSE":return False
        transition_work_order(s,wo,"CLOSED",actor=f"User:{user.id}",reason="Authorised closure")
        audit(s,wo.id,f"User:{user.id}","WORK_ORDER_CLOSED","")
        s.commit();return True


def resolve_escalation(escalation_id,actor_user_id,reason):
    reason=(reason or "").strip()
    if len(reason)<5:return False
    if len(reason) > ESCALATION_RESOLUTION_MAX:
        return False
    with SessionLocal() as s:
        escalation=s.get(Escalation,escalation_id)
        work_order=s.get(WorkOrder,escalation.work_order_id) if escalation and escalation.work_order_id else None
        if not escalation or escalation.status!="OPEN" or not work_order:return False
        user=_authorised_user(s,actor_user_id,work_order.client_id,{"admin","manager","safety_manager"})
        if not user:return False
        if escalation.level=="RED" and critical_safety_active(s,work_order.id):return False
        escalation.status="RESOLVED"
        audit(s,work_order.id,f"User:{user.id}","ESCALATION_RESOLVED",json.dumps({"escalation_id":escalation.id,"reason":reason}))
        s.commit();return True

from decision_engine import TRADE as DECISION_TRADE
TRADE = DECISION_TRADE

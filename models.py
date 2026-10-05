import os
from datetime import datetime
import json
from clock import utcnow

from sqlalchemy import create_engine, event, inspect, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker
from lifecycle_rules import transition_allowed
from dotenv import load_dotenv
load_dotenv()

DB_URL=os.getenv("DATABASE_URL","sqlite:///maintenanceos_v1.db")
engine=create_engine(DB_URL,connect_args={"check_same_thread":False} if DB_URL.startswith("sqlite") else {})
SessionLocal=sessionmaker(bind=engine,expire_on_commit=False)

class Base(DeclarativeBase): pass


class WorkOrderStateError(ValueError):
    pass

class Client(Base):
    __tablename__="clients"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    name:Mapped[str]=mapped_column(String(200))
    quote_approval_limit:Mapped[float]=mapped_column(Float,default=250)
    invoice_variance_percent:Mapped[float]=mapped_column(Float,default=10)

class User(Base):
    __tablename__="users"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    email:Mapped[str]=mapped_column(String(320),unique=True,index=True)
    password_hash:Mapped[str]=mapped_column(String(255))
    role:Mapped[str]=mapped_column(String(30),default="manager")
    active:Mapped[bool]=mapped_column(Boolean,default=True)

class Property(Base):
    __tablename__="properties"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    address:Mapped[str]=mapped_column(String(300))
    postcode:Mapped[str]=mapped_column(String(20),index=True)
    property_type:Mapped[str]=mapped_column(String(80),default="")
    access_notes:Mapped[str]=mapped_column(Text,default="")
    emergency_notes:Mapped[str]=mapped_column(Text,default="")

class Resident(Base):
    __tablename__="residents"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    property_id:Mapped[int]=mapped_column(ForeignKey("properties.id"),index=True)
    name:Mapped[str]=mapped_column(String(200))
    phone:Mapped[str]=mapped_column(String(50),index=True)
    email:Mapped[str]=mapped_column(String(320),index=True)
    active:Mapped[bool]=mapped_column(Boolean,default=True)

class Contractor(Base):
    __tablename__="contractors"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    name:Mapped[str]=mapped_column(String(200))
    trade:Mapped[str]=mapped_column(String(100),index=True)
    postcode_coverage:Mapped[str]=mapped_column(Text,default="")
    email:Mapped[str]=mapped_column(String(320),default="")
    phone:Mapped[str]=mapped_column(String(50),default="")
    qualification_summary:Mapped[str]=mapped_column(Text,default="")
    qualification_expiry:Mapped[str]=mapped_column(String(30),default="")
    insurance_expiry:Mapped[str]=mapped_column(String(30),default="")
    callout_rate:Mapped[float]=mapped_column(Float,default=0)
    hourly_rate:Mapped[float]=mapped_column(Float,default=0)
    rating:Mapped[float]=mapped_column(Float,default=5)
    acceptance_rate:Mapped[float]=mapped_column(Float,default=1)
    first_time_fix_rate:Mapped[float]=mapped_column(Float,default=1)
    avg_response_minutes:Mapped[float]=mapped_column(Float,default=60)
    active:Mapped[bool]=mapped_column(Boolean,default=True)

class WorkOrder(Base):
    __tablename__="work_orders"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    property_id:Mapped[int]=mapped_column(ForeignKey("properties.id"),index=True)
    resident_id:Mapped[int|None]=mapped_column(ForeignKey("residents.id"),nullable=True,index=True)
    source:Mapped[str]=mapped_column(String(30),default="MANUAL")
    description:Mapped[str]=mapped_column(Text)
    category:Mapped[str]=mapped_column(String(100),default="Unknown")
    trade:Mapped[str]=mapped_column(String(100),default="General")
    urgency:Mapped[str]=mapped_column(String(10),default="P3")
    status:Mapped[str]=mapped_column(String(80),default="NEW")
    safety_flags:Mapped[str]=mapped_column(Text,default="[]")
    ai_confidence:Mapped[float]=mapped_column(Float,default=0)
    assigned_contractor_id:Mapped[int|None]=mapped_column(ForeignKey("contractors.id"),nullable=True)
    repeat_repair:Mapped[bool]=mapped_column(Boolean,default=False)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    closed_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)

class Approval(Base):
    __tablename__="approvals"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    approval_type:Mapped[str]=mapped_column(String(80))
    proposed_action:Mapped[str]=mapped_column(Text)
    reason:Mapped[str]=mapped_column(Text)
    amount:Mapped[float|None]=mapped_column(Float,nullable=True)
    status:Mapped[str]=mapped_column(String(30),default="PENDING")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    decided_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)

class Appointment(Base):
    __tablename__="appointments"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    start_at:Mapped[datetime]=mapped_column(DateTime)
    end_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
    status:Mapped[str]=mapped_column(String(40),default="PROPOSED")
    resident_confirmed:Mapped[bool]=mapped_column(Boolean,default=False)

class ContractorAvailability(Base):
    __tablename__="contractor_availability"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    slot_start:Mapped[datetime]=mapped_column(DateTime)
    slot_end:Mapped[datetime]=mapped_column(DateTime)
    submitted_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


class ContractorAcceptance(Base):
    __tablename__="contractor_acceptances"
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),primary_key=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    action_key:Mapped[str]=mapped_column(String(200),unique=True)
    accepted_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


class ContractorAttempt(Base):
    __tablename__="contractor_attempts"
    __table_args__=(UniqueConstraint("work_order_id","contractor_id",name="uq_work_order_contractor_attempt"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    status:Mapped[str]=mapped_column(String(30),default="OFFERED",index=True)
    offered_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    responded_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)

class Quote(Base):
    __tablename__="quotes"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    amount:Mapped[float]=mapped_column(Float)
    description:Mapped[str]=mapped_column(Text,default="")
    status:Mapped[str]=mapped_column(String(30),default="SUBMITTED")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class CompletionEvidence(Base):
    __tablename__="completion_evidence"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    completion_note:Mapped[str]=mapped_column(Text)
    evidence_url:Mapped[str]=mapped_column(Text,default="")
    submitted_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class ResidentConfirmation(Base):
    __tablename__="resident_confirmations"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    resolved:Mapped[bool]=mapped_column(Boolean)
    comment:Mapped[str]=mapped_column(Text,default="")
    submitted_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class Invoice(Base):
    __tablename__="invoices"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    invoice_number:Mapped[str]=mapped_column(String(100),index=True)
    amount:Mapped[float]=mapped_column(Float)
    description:Mapped[str]=mapped_column(Text,default="")
    status:Mapped[str]=mapped_column(String(40),default="RECEIVED")
    anomaly_score:Mapped[float]=mapped_column(Float,default=0)
    anomaly_reasons:Mapped[str]=mapped_column(Text,default="[]")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class Communication(Base):
    __tablename__="communications"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    channel:Mapped[str]=mapped_column(String(30))
    direction:Mapped[str]=mapped_column(String(20))
    participant:Mapped[str]=mapped_column(String(320))
    body:Mapped[str]=mapped_column(Text,default="")
    media_url:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


class CommunicationDelivery(Base):
    __tablename__="communication_deliveries"
    __table_args__=(UniqueConstraint("client_id","channel","action_key",name="uq_delivery_action"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    communication_id:Mapped[int]=mapped_column(ForeignKey("communications.id"),unique=True,index=True)
    channel:Mapped[str]=mapped_column(String(30),index=True)
    action_key:Mapped[str]=mapped_column(String(200))
    status:Mapped[str]=mapped_column(String(30),default="QUEUED",index=True)
    provider_reference:Mapped[str]=mapped_column(String(200),default="")
    failure_code:Mapped[str]=mapped_column(String(100),default="")
    attempts:Mapped[int]=mapped_column(Integer,default=0)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


class UnmatchedInbound(Base):
    __tablename__="unmatched_inbound"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    channel:Mapped[str]=mapped_column(String(30))
    participant_hash:Mapped[str]=mapped_column(String(64),default="")
    body:Mapped[str]=mapped_column(Text,default="")
    media_url:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class AutomationJob(Base):
    __tablename__="automation_jobs"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    job_type:Mapped[str]=mapped_column(String(100))
    run_at:Mapped[datetime]=mapped_column(DateTime,index=True)
    payload:Mapped[str]=mapped_column(Text,default="{}")
    status:Mapped[str]=mapped_column(String(30),default="PENDING")
    attempts:Mapped[int]=mapped_column(Integer,default=0)

class DataLifecycleHold(Base):
    __tablename__="data_lifecycle_holds"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    scope:Mapped[str]=mapped_column(String(30),index=True)
    scope_id:Mapped[str]=mapped_column(String(200),index=True)
    reason:Mapped[str]=mapped_column(Text)
    created_by:Mapped[str]=mapped_column(String(100))
    active:Mapped[bool]=mapped_column(Boolean,default=True,index=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    released_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)


class DataLifecycleRequest(Base):
    __tablename__="data_lifecycle_requests"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    request_type:Mapped[str]=mapped_column(String(40),index=True)
    subject_id:Mapped[str]=mapped_column(String(200),default="",index=True)
    status:Mapped[str]=mapped_column(String(30),default="PENDING",index=True)
    requested_by:Mapped[str]=mapped_column(String(100))
    reason:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    completed_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)


class Escalation(Base):
    __tablename__="escalations"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    level:Mapped[str]=mapped_column(String(20))
    reason:Mapped[str]=mapped_column(Text)
    status:Mapped[str]=mapped_column(String(30),default="OPEN")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class AuditEvent(Base):
    __tablename__="audit_events"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    actor:Mapped[str]=mapped_column(String(100))
    event:Mapped[str]=mapped_column(String(100))
    detail:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class TenantBoundary(Base):
    __tablename__="tenant_boundaries"
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),primary_key=True)
    mode:Mapped[str]=mapped_column(String(40),index=True)
    label:Mapped[str]=mapped_column(String(200),default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class CallSessionTenant(Base):
    __tablename__="call_session_tenants"
    call_session_id:Mapped[int]=mapped_column(ForeignKey("call_sessions.id"),primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)

class CriticalSafetyState(Base):
    __tablename__="critical_safety_states"
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    active:Mapped[bool]=mapped_column(Boolean,default=True,index=True)
    flags:Mapped[str]=mapped_column(Text,default="[]")
    established_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    established_by:Mapped[str]=mapped_column(String(100),default="Decision Engine")
    cleared_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
    cleared_by_user_id:Mapped[int|None]=mapped_column(ForeignKey("users.id"),nullable=True)
    clearance_reason:Mapped[str]=mapped_column(Text,default="")
    version:Mapped[int]=mapped_column(Integer,default=1)

class IncidentIdentity(Base):
    __tablename__="incident_identities"
    __table_args__=(UniqueConstraint("client_id","incident_key",name="uq_incident_client_key"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    incident_key:Mapped[str]=mapped_column(String(200))
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),unique=True,index=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class ChannelEventIdentity(Base):
    __tablename__="channel_event_identities"
    __table_args__=(UniqueConstraint("client_id","source","event_key",name="uq_channel_event"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    source:Mapped[str]=mapped_column(String(30))
    event_key:Mapped[str]=mapped_column(String(200))
    work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class ActionReceipt(Base):
    __tablename__="action_receipts"
    __table_args__=(UniqueConstraint("client_id","scope","action_key",name="uq_action_client_scope_key"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    scope:Mapped[str]=mapped_column(String(80),index=True)
    action_key:Mapped[str]=mapped_column(String(200))
    client_id:Mapped[int|None]=mapped_column(ForeignKey("clients.id"),nullable=True,index=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    result_ref:Mapped[str]=mapped_column(String(200),default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


class ActionExecution(Base):
    __tablename__="action_executions"
    __table_args__=(UniqueConstraint("client_id","action_type","action_key",name="uq_action_execution"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True,index=True)
    action_type:Mapped[str]=mapped_column(String(100),index=True)
    action_key:Mapped[str]=mapped_column(String(200))
    status:Mapped[str]=mapped_column(String(30),index=True)
    provider_reference:Mapped[str]=mapped_column(String(200),default="")
    detail:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class InvoiceIdentity(Base):
    __tablename__="invoice_identities"
    __table_args__=(UniqueConstraint("client_id","contractor_id","normalised_invoice_number",name="uq_invoice_identity"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    normalised_invoice_number:Mapped[str]=mapped_column(String(100))
    first_invoice_id:Mapped[int|None]=mapped_column(ForeignKey("invoices.id"),nullable=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class EvidenceIdentity(Base):
    __tablename__="evidence_identities"
    fingerprint:Mapped[str]=mapped_column(String(64),primary_key=True)
    first_work_order_id:Mapped[int]=mapped_column(ForeignKey("work_orders.id"),index=True)
    first_contractor_id:Mapped[int]=mapped_column(ForeignKey("contractors.id"),index=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)

class RuntimeControl(Base):
    __tablename__="runtime_controls"
    key:Mapped[str]=mapped_column(String(100),primary_key=True)
    enabled:Mapped[bool]=mapped_column(Boolean,default=False)
    updated_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    updated_by:Mapped[str]=mapped_column(String(100),default="system")
    reason:Mapped[str]=mapped_column(Text,default="")

class CallSession(Base):
    __tablename__="call_sessions"
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    call_sid:Mapped[str]=mapped_column(String(100),unique=True,index=True)
    caller:Mapped[str]=mapped_column(String(60))
    resident_id:Mapped[int|None]=mapped_column(ForeignKey("residents.id"),nullable=True)
    work_order_id:Mapped[int|None]=mapped_column(ForeignKey("work_orders.id"),nullable=True)
    verification_status:Mapped[str]=mapped_column(String(30),default="UNVERIFIED")
    transcript:Mapped[str]=mapped_column(Text,default="")
    summary:Mapped[str]=mapped_column(Text,default="")
    started_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)
    ended_at:Mapped[datetime|None]=mapped_column(DateTime,nullable=True)


class CallEvent(Base):
    __tablename__="call_events"
    __table_args__=(UniqueConstraint("call_session_id","event_key",name="uq_call_event_key"),)
    id:Mapped[int]=mapped_column(Integer,primary_key=True)
    call_session_id:Mapped[int]=mapped_column(ForeignKey("call_sessions.id"),index=True)
    client_id:Mapped[int]=mapped_column(ForeignKey("clients.id"),index=True)
    event_key:Mapped[str]=mapped_column(String(200))
    event:Mapped[str]=mapped_column(String(100),index=True)
    detail:Mapped[str]=mapped_column(Text,default="")
    created_at:Mapped[datetime]=mapped_column(DateTime,default=utcnow)


def _decoded_flags(value: str) -> list:
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else [{"code": "INVALID_SAFETY_STATE"}]
    except (TypeError, json.JSONDecodeError):
        return [{"code": "INVALID_SAFETY_STATE"}]


@event.listens_for(Session, "before_flush")
def enforce_work_order_invariants(session, _flush_context, _instances):
    """Make lifecycle and critical-latch controls apply to every ORM write path."""
    clearance_markers = session.info.get("authorized_safety_clearances", {})

    for obj in session.deleted:
        if isinstance(obj, CriticalSafetyState) and obj.active:
            raise WorkOrderStateError("An active critical-safety latch cannot be deleted")
        if isinstance(obj, WorkOrder):
            state = session.get(CriticalSafetyState, obj.id)
            if state and state.active:
                raise WorkOrderStateError("A work order with active critical safety cannot be deleted")

    for state in (obj for obj in session.dirty if isinstance(obj, CriticalSafetyState)):
        history = inspect(state).attrs.active.history
        was_active = True in history.deleted
        if was_active and not state.active:
            marker = clearance_markers.get(state.work_order_id)
            audited = any(
                isinstance(item, AuditEvent)
                and item.work_order_id == state.work_order_id
                and item.event == "CRITICAL_SAFETY_CLEARED"
                for item in session.new
            )
            reviewed = any(
                isinstance(item, Approval)
                and item.work_order_id == state.work_order_id
                and item.approval_type == "POST_SAFETY_CLEARANCE"
                for item in session.new
            )
            if not marker or not audited or not reviewed:
                raise WorkOrderStateError(
                    "Critical safety can only be cleared by the authorised audited clearance operation"
                )

    for work_order in (obj for obj in session.dirty if isinstance(obj, WorkOrder)):
        state = session.get(CriticalSafetyState, work_order.id)
        current_flags = _decoded_flags(work_order.safety_flags)
        active = bool((state and state.active) or current_flags)
        status_history = inspect(work_order).attrs.status.history
        old_status = status_history.deleted[0] if status_history.deleted else work_order.status
        status_changed = status_history.has_changes()

        if active:
            if work_order.status != "HUMAN_REVIEW":
                raise WorkOrderStateError("Active critical safety must remain in HUMAN_REVIEW")
            if work_order.urgency != "P1":
                raise WorkOrderStateError("Active critical safety must remain P1")
            if not current_flags:
                raise WorkOrderStateError("Active critical safety flags cannot be cleared")

        safety_history = inspect(work_order).attrs.safety_flags.history
        old_flags = _decoded_flags(safety_history.deleted[0]) if safety_history.deleted else []
        if old_flags and not current_flags and work_order.id not in clearance_markers:
            raise WorkOrderStateError(
                "Critical safety flags can only be cleared by the authorised clearance operation"
            )

        if status_changed and work_order.status != "HUMAN_REVIEW":
            blocking_types = {
                "SAFETY", "POST_SAFETY_CLEARANCE", "IDENTITY", "HUMAN_ESCALATION",
                "TRIAGE", "REPEAT_REPAIR", "EVIDENCE_REUSE", "CONTRACTOR_TIMEOUT",
            }
            with session.no_autoflush:
                approvals = session.query(Approval).filter_by(work_order_id=work_order.id).all()
            if any(item.status == "PENDING" and item.approval_type in blocking_types for item in approvals):
                raise WorkOrderStateError("A pending human-review hold blocks work-order progression")
            if not transition_allowed(old_status, work_order.status):
                raise WorkOrderStateError(
                    f"Illegal work-order transition: {old_status} -> {work_order.status}"
                )
        if work_order.status == "CLOSED" and work_order.closed_at is None:
            raise WorkOrderStateError("Closed work orders require a closure timestamp")
        if work_order.status != "CLOSED" and old_status == "CLOSED" and work_order.closed_at is not None:
            raise WorkOrderStateError("Reopened work orders cannot retain a closure timestamp")

def init_db():
    Base.metadata.create_all(engine)

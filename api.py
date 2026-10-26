import hmac
import hashlib
import json
import math
import os
import threading
from contextlib import suppress
from datetime import datetime,timedelta
from fastapi import Depends,FastAPI,Request,HTTPException,Form,WebSocket
from fastapi.responses import HTMLResponse,Response
from sqlalchemy.exc import SQLAlchemyError
from models import *
from decision_engine import apply_intake_rules
from operations import *
from security import verify_link
from idempotency import claim_action,set_ai_side_effects
from safety_controls import SafetyStateError,SAFETY_CLEARANCE_REASON_MAX,clear_critical_safety,critical_safety_active
from tenant_security import TenantAccessError,configured_voice_client_id,internal_api_tenant_ready,require_client_resource
from dotenv import load_dotenv
from webhook_security import public_provider_ingress_ready,targets_dedicated_test_number,validate_twilio
from ingress_security import HttpSecurityBoundary,MAX_REQUEST_BYTES
from channels import resident_by_phone,create_from_channel
from identity import postcode_matches
from readiness import report as readiness_report
from call_capacity import (
    CapacityRejected,
    admit_call,
    capacity_snapshot,
    has_call_capacity_lease,
    release_call_capacity_only,
    release_call_lease,
)
from voice_bridge import (
    create_call_session,
    inbound_fallback_twiml,
    inbound_stream_twiml,
    record_call_interruption,
    record_stream_status,
    is_active_call_session,
)
from provider_runtime import handle_provider_media_stream, provider_ready
load_dotenv()
from product_profile import api_title
app=FastAPI(title=api_title(),docs_url=None,redoc_url=None,openapi_url=None)
init_db()
# Optional one-shot completion-email proof on boot (no Twilio / no pilot ceiling).
with suppress(Exception):
    from pilot.email_selftest import run_email_selftest_if_configured
    run_email_selftest_if_configured()
app.add_middleware(HttpSecurityBoundary,maximum_body_bytes=MAX_REQUEST_BYTES)


async def _json_object(request: Request) -> dict:
    try:
        value = await request.json()
    except Exception as exc:
        raise HTTPException(400, "Malformed JSON request") from exc
    if not isinstance(value, dict):
        raise HTTPException(400, "JSON object required")
    return value


def _positive_int(value, name: str) -> int:
    if isinstance(value, bool):
        raise HTTPException(400, f"{name} must be a positive integer")
    try:
        result = int(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(400, f"{name} must be a positive integer") from exc
    if result <= 0:
        raise HTTPException(400, f"{name} must be a positive integer")
    return result


AMOUNT_MAX = 1_000_000

def _positive_amount(value) -> float:
    if isinstance(value, bool):
        raise HTTPException(400, "amount must be a positive number")
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(400, "amount must be a positive number") from exc
    if not math.isfinite(result) or result <= 0:
        raise HTTPException(400, "amount must be a positive number")
    if result > AMOUNT_MAX:
        raise HTTPException(400, "amount is too large")
    return result


WORK_ORDER_SOURCES = frozenset({
    "API","MANUAL","VOICE","SMS","EMAIL","WHATSAPP","TEST","HARNESS","LOCAL_ACCEPTANCE",
})


def _bounded_text(value, name: str, *, required=False, maximum=10000) -> str:
    if not isinstance(value, str):
        raise HTTPException(400, f"{name} must be text")
    result = value.strip()
    if required and not result:
        raise HTTPException(400, f"{name} is required")
    if len(result) > maximum:
        raise HTTPException(400, f"{name} is too long")
    return result


_ALLOWED_CONTROLS = frozenset("\t\n\r")


def _reject_control_chars(value: str, name: str) -> str:
    if any(ord(ch) < 32 and ch not in _ALLOWED_CONTROLS for ch in value):
        raise HTTPException(400, f"{name} contains control characters")
    return value


def require_internal_api(request:Request):
    expected=os.getenv("INTERNAL_API_TOKEN","")
    if len(expected)<32:
        raise HTTPException(503,"Internal API is not configured")
    authorization=request.headers.get("Authorization","")
    supplied=authorization[7:] if authorization.startswith("Bearer ") else ""
    if not supplied or not hmac.compare_digest(supplied,expected):
        raise HTTPException(401,"Invalid internal API credentials")
    try:
        client_id=int(os.getenv("INTERNAL_API_CLIENT_ID",""))
    except ValueError:
        raise HTTPException(503,"Internal API tenant is not configured")
    with SessionLocal() as s:
        if not s.get(Client,client_id):raise HTTPException(503,"Internal API tenant is unavailable")
    if not internal_api_tenant_ready(lambda:SessionLocal()):
        raise HTTPException(503,"Internal API tenant boundary is unavailable")
    request.state.client_id=client_id
    return client_id

def _safety_clear(wo):
    try:
        return not json.loads(wo.safety_flags or "[]")
    except (TypeError,json.JSONDecodeError):
        return False

def _contractor_work_order(s,work_order_id,contractor_id,allowed_statuses):
    wo=s.query(WorkOrder).filter_by(id=work_order_id,assigned_contractor_id=contractor_id).first()
    if not wo or wo.status not in allowed_statuses or not _safety_clear(wo) or critical_safety_active(s,work_order_id):
        return None
    return wo


def require_contractor_portal():
    if os.getenv("ENABLE_CONTRACTOR_PORTAL", "false").lower() != "true":
        raise HTTPException(503, "Contractor portal is disabled")


def require_public_provider_ingress():
    if not public_provider_ingress_ready():
        raise HTTPException(503, "Public provider ingress is disabled")

@app.get("/health")
def health():
    snap = capacity_snapshot()
    pilot = {}
    try:
        from pilot.runtime_guard import pilot_status

        pilot = pilot_status()
    except Exception:
        pilot = {"armed": False, "error": "pilot_status_unavailable"}
    return {
        "ok": True,
        "version": "v1-pilot",
        "realtime_voice": os.getenv("ENABLE_REALTIME_VOICE", "false").lower() == "true",
        "active_calls": snap.active_calls,
        "call_capacity": {
            "active": snap.active_calls,
            "global_limit": snap.global_limit,
            "per_client_limit": snap.per_client_limit,
            "backend": snap.backend,
            "draining": snap.draining,
            "ai_session_utilisation": snap.ai_session_utilisation,  # lease util, not mock AI contexts
            "estimated_hourly_burn_usd": snap.estimated_hourly_burn_usd,
            "by_client": {str(k): v for k, v in snap.by_client.items()},
        },
        "pilot": pilot,
    }

@app.post("/work-orders")
async def create_work_order(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    if "client_id" in d and _positive_int(d["client_id"],"client_id")!=client_id:raise HTTPException(403,"Cross-tenant request rejected")
    property_id=_positive_int(d.get("property_id"),"property_id")
    resident_id=_positive_int(d["resident_id"],"resident_id") if d.get("resident_id") is not None else None
    description=_reject_control_chars(_bounded_text(d.get("description"),"description",required=True),"description")
    identity_verified=d.get("identity_verified",False)
    if not isinstance(identity_verified,bool):raise HTTPException(400,"identity_verified must be a boolean")
    source=_bounded_text(d.get("source","API"),"source",required=True,maximum=30)
    if source not in WORK_ORDER_SOURCES:raise HTTPException(400,"source is not allowed")
    try:
        wid=create_from_channel(client_id,property_id,resident_id,source,description,
                                identity_verified=identity_verified,
                                incident_key=d.get("incident_key"),event_key=request.headers.get("Idempotency-Key"))
    except TenantAccessError as exc:raise HTTPException(403,str(exc))
    with SessionLocal() as s:
        wo=s.get(WorkOrder,wid);cid=wo.assigned_contractor_id if wo else None
    return {"work_order_id":wid,"recommended_contractor_id":cid}

@app.get("/contractor/decision",response_class=HTMLResponse)
def contractor_decision(work_order_id:int,contractor_id:int,decision:str,token:str):
    require_contractor_portal()
    if decision not in ("accept","decline"):raise HTTPException(400,"Invalid decision")
    if not verify_link(decision,work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    with SessionLocal() as s:
        wo=_contractor_work_order(s,work_order_id,contractor_id,{"AWAITING_CONTRACTOR"})
        approval=s.query(Approval).filter_by(work_order_id=work_order_id,approval_type="DISPATCH",status="APPROVED").first()
        if not wo or not approval:raise HTTPException(409,"Job is not available for this action")
    label="Accept job" if decision=="accept" else "Decline job"
    return f"""<h2>Confirm action for job #{work_order_id}</h2>
<form method="post" action="/contractor/decision">
<input type="hidden" name="work_order_id" value="{work_order_id}">
<input type="hidden" name="contractor_id" value="{contractor_id}">
<input type="hidden" name="decision" value="{decision}">
<input type="hidden" name="token" value="{token}">
<button type="submit">{label}</button></form>"""


@app.post("/contractor/decision",response_class=HTMLResponse)
def contractor_decision_submit(work_order_id:int=Form(...),contractor_id:int=Form(...),decision:str=Form(...),token:str=Form(...)):
    require_contractor_portal()
    if decision not in ("accept","decline"):raise HTTPException(400,"Invalid decision")
    if not verify_link(decision,work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    if decision=="decline":
        try:declined=decline_contractor(work_order_id,contractor_id,token)
        except (TenantAccessError,SafetyStateError):declined=False
        if not declined:raise HTTPException(409,"Job is not available for this action")
        msg="Decline recorded."
    if decision=="accept":
        try:accepted=accept_contractor(work_order_id,contractor_id,token)
        except (TenantAccessError,SafetyStateError):accepted=False
        if not accepted:raise HTTPException(409,"Job is not available for this action")
        msg="Job accepted. Please now submit your availability."
    return f"<h2>{msg}</h2><p>Job #{work_order_id}</p>"

@app.get("/contractor/availability",response_class=HTMLResponse)
def availability_form(work_order_id:int,contractor_id:int,token:str):
    require_contractor_portal()
    if not verify_link("availability",work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    with SessionLocal() as s:
        if not _contractor_work_order(s,work_order_id,contractor_id,{"CONTRACTOR_ACCEPTED","AWAITING_AVAILABILITY"}):
            raise HTTPException(409,"Job is not available for this action")
    return f"""<h2>Submit availability for job #{work_order_id}</h2>
<form method="post">
<input type="hidden" name="work_order_id" value="{work_order_id}">
<input type="hidden" name="contractor_id" value="{contractor_id}">
<input type="hidden" name="token" value="{token}">
<label>Start (YYYY-MM-DD HH:MM)</label><input name="start"><br>
<label>End (YYYY-MM-DD HH:MM)</label><input name="end"><br>
<button type="submit">Submit</button></form>"""

AVAILABILITY_SLOT_MAX_DAYS=14

def validate_availability_slot(start:datetime,end:datetime)->None:
    if end<=start:raise HTTPException(400,"End must be after start")
    if end-start>timedelta(days=AVAILABILITY_SLOT_MAX_DAYS):
        raise HTTPException(400,"Availability slot is too long")

@app.post("/contractor/availability",response_class=HTMLResponse)
def availability_submit(work_order_id:int=Form(...),contractor_id:int=Form(...),token:str=Form(...),start:str=Form(...),end:str=Form(...)):
    require_contractor_portal()
    if not verify_link("availability",work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    try:st=datetime.strptime(start,"%Y-%m-%d %H:%M");en=datetime.strptime(end,"%Y-%m-%d %H:%M")
    except ValueError as exc:raise HTTPException(400,"Invalid availability date/time") from exc
    validate_availability_slot(st,en)
    try:availability_id=submit_availability(work_order_id,contractor_id,st,en,token)
    except (TenantAccessError,SafetyStateError):availability_id=None
    if not availability_id:raise HTTPException(409,"Job is not available for this action")
    return "<h2>Availability received.</h2>"

@app.get("/contractor/complete",response_class=HTMLResponse)
def complete_form(work_order_id:int,contractor_id:int,token:str):
    require_contractor_portal()
    if not verify_link("complete",work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    with SessionLocal() as s:
        if not _contractor_work_order(s,work_order_id,contractor_id,{"APPOINTMENT_BOOKED","IN_PROGRESS","AWAITING_COMPLETION_EVIDENCE"}):
            raise HTTPException(409,"Job is not available for this action")
    return f"""<h2>Complete job #{work_order_id}</h2><form method="post">
<input type="hidden" name="work_order_id" value="{work_order_id}">
<input type="hidden" name="contractor_id" value="{contractor_id}">
<input type="hidden" name="token" value="{token}">
<label>Completion note</label><textarea name="note"></textarea><br>
<label>Evidence URL (optional)</label><input name="evidence_url"><br>
<button type="submit">Submit completion</button></form>"""

@app.post("/contractor/complete",response_class=HTMLResponse)
def complete_submit(work_order_id:int=Form(...),contractor_id:int=Form(...),token:str=Form(...),note:str=Form(...),evidence_url:str=Form("")):
    require_contractor_portal()
    if not verify_link("complete",work_order_id,contractor_id,token):raise HTTPException(403,"Invalid link")
    try:evidence_id=submit_completion(work_order_id,contractor_id,note,evidence_url,token)
    except (TenantAccessError,SafetyStateError):evidence_id=None
    if not evidence_id:raise HTTPException(409,"Job is not available for this action")
    return "<h2>Completion recorded.</h2>"

@app.post("/quotes")
async def quotes(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    work_order_id=_positive_int(d.get("work_order_id"),"work_order_id")
    contractor_id=_positive_int(d.get("contractor_id"),"contractor_id")
    amount=_positive_amount(d.get("amount"))
    description=_bounded_text(d.get("description",""),"description")
    with SessionLocal() as s:
        try:require_client_resource(s,client_id,work_order_id=work_order_id,contractor_id=contractor_id)
        except TenantAccessError as exc:raise HTTPException(403,str(exc))
    try:qid=submit_quote(work_order_id,contractor_id,amount,description)
    except (SafetyStateError,TenantAccessError) as exc:raise HTTPException(409,str(exc))
    if not qid:raise HTTPException(409,"Quote is not valid for the current work-order state")
    return {"quote_id":qid}

@app.post("/invoices")
async def invoices(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    work_order_id=_positive_int(d.get("work_order_id"),"work_order_id")
    contractor_id=_positive_int(d.get("contractor_id"),"contractor_id")
    amount=_positive_amount(d.get("amount"))
    invoice_number=_bounded_text(d.get("invoice_number"),"invoice_number",required=True,maximum=128)
    description=_bounded_text(d.get("description",""),"description")
    with SessionLocal() as s:
        try:require_client_resource(s,client_id,work_order_id=work_order_id,contractor_id=contractor_id)
        except TenantAccessError as exc:raise HTTPException(403,str(exc))
    try:iid=invoice_qa(work_order_id,contractor_id,invoice_number,amount,description)
    except (SafetyStateError,TenantAccessError) as exc:raise HTTPException(409,str(exc))
    if not iid:raise HTTPException(409,"Invoice is not valid for the current work-order state")
    return {"invoice_id":iid}

@app.post("/resident-confirmation")
async def confirm(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    work_order_id=_positive_int(d.get("work_order_id"),"work_order_id")
    resolved=d.get("resolved")
    if not isinstance(resolved,bool):raise HTTPException(400,"resolved must be a boolean")
    comment=_bounded_text(d.get("comment",""),"comment")
    with SessionLocal() as s:
        try:require_client_resource(s,client_id,work_order_id=work_order_id)
        except TenantAccessError as exc:raise HTTPException(403,str(exc))
    try:recorded=resident_confirmation(work_order_id,resolved,comment)
    except SafetyStateError as exc:raise HTTPException(409,str(exc))
    if not recorded:raise HTTPException(409,"Confirmation is not valid for the current work-order state")
    return {"ok":True}


@app.post("/appointments/confirm")
async def appointment_confirm(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    work_order_id=_positive_int(d.get("work_order_id"),"work_order_id")
    resident_id=_positive_int(d.get("resident_id"),"resident_id")
    event_key=_bounded_text(
        request.headers.get("Idempotency-Key", ""),"Idempotency-Key",required=True,maximum=200
    )
    with SessionLocal() as s:
        try:require_client_resource(
            s,client_id,work_order_id=work_order_id,resident_id=resident_id
        )
        except TenantAccessError as exc:raise HTTPException(403,str(exc))
    try:recorded=confirm_appointment(work_order_id,resident_id,event_key)
    except (SafetyStateError,TenantAccessError) as exc:raise HTTPException(409,str(exc))
    if not recorded:raise HTTPException(409,"Appointment cannot be confirmed in the current state")
    return {"confirmed":True}


@app.post("/messaging/inbound")
async def messaging_inbound(request:Request):
    if os.getenv("ENABLE_LIVE_MESSAGING", "false").lower() != "true":
        raise HTTPException(503,"Live messaging is disabled")
    require_public_provider_ingress()
    form=await request.form()
    params=dict(form)
    sig=request.headers.get("X-Twilio-Signature","")
    if not validate_twilio(str(request.url),params,sig):
        raise HTTPException(403,"Invalid Twilio signature")
    if not targets_dedicated_test_number(params):
        raise HTTPException(403,"Request is not for the dedicated test number")
    sender=str(form.get("From",""))
    body=str(form.get("Body",""))
    media=str(form.get("MediaUrl0",""))
    channel="WHATSAPP" if sender.startswith("whatsapp:") else "SMS"
    phone=sender.replace("whatsapp:","")
    client_id=configured_voice_client_id()
    rid=resident_by_phone(phone,client_id) if client_id else None
    if not rid:
        if client_id:
            with SessionLocal() as s:
                s.add(UnmatchedInbound(
                    client_id=client_id,
                    channel=channel,
                    participant_hash=hashlib.sha256(phone.encode()).hexdigest(),
                    body=body,
                    media_url=media,
                ))
                s.commit()
        return Response('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thanks. Your report has been received for review.</Message></Response>',media_type="application/xml")
    with SessionLocal() as s:
        r=s.query(Resident).filter_by(id=rid).first()
        create_from_channel(r.client_id,r.property_id,r.id,channel,body,participant=phone,media_url=media,identity_verified=False,
                            event_key=str(form.get("MessageSid","") or f"message:{channel}:{phone}:{body}"))
    return Response('<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thanks. Your report has been received for review.</Message></Response>',media_type="application/xml")

def _schedule_pending_voice_lease_cleanup(call_sid: str, call_session_id: int) -> None:
    """Free admission capacity if Twilio never opens the Media Stream.

    This prevents signed probes, carrier failures, or interrupted TwiML handoff from
    permanently consuming all call slots. A real Media Stream claims the session
    immediately and is never released by this pending-admission timer.
    """
    try:
        delay = float(os.getenv("VOICE_PENDING_LEASE_TIMEOUT_SECONDS", "30"))
    except ValueError:
        delay = 30.0
    delay = max(10.0, min(delay, 120.0))

    def cleanup() -> None:
        try:
            if (
                has_call_capacity_lease(call_sid=call_sid, call_session_id=call_session_id)
                and not is_active_call_session(call_session_id)
            ):
                release_call_capacity_only(
                    call_sid=call_sid,
                    call_session_id=call_session_id,
                )
                with suppress(Exception):
                    record_call_interruption(call_session_id, "voice_stream_not_started")
        except Exception:
            # Capacity cleanup must never take the API process down.
            pass

    timer = threading.Timer(delay, cleanup)
    timer.daemon = True
    timer.start()


@app.post("/voice/inbound")
async def voice_inbound(request:Request):
    require_public_provider_ingress()
    form=await request.form()
    params=dict(form)
    sig=request.headers.get("X-Twilio-Signature","")
    if not validate_twilio(str(request.url),params,sig):
        raise HTTPException(403,"Invalid Twilio signature")
    if not targets_dedicated_test_number(params):
        raise HTTPException(403,"Request is not for the dedicated test number")
    call_sid=str(form.get("CallSid",""))
    caller=str(form.get("From",""))
    if not call_sid:
        raise HTTPException(400,"Missing CallSid")
    tenant_id=configured_voice_client_id()
    if tenant_id is None:
        return Response(inbound_fallback_twiml("The automated service is unavailable."),media_type="application/xml")
    try:
        call_session_id=create_call_session(call_sid,caller,tenant_id)
    except (SQLAlchemyError,TenantAccessError):
        return Response(inbound_fallback_twiml("The automated service is unavailable."),media_type="application/xml")
    try:
        admit_call(
            call_sid=call_sid,
            call_session_id=call_session_id,
            client_id=tenant_id,
            tenant_id="chapelgate",
        )
    except CapacityRejected:
        with suppress(Exception):
            record_call_interruption(call_session_id, "capacity_rejected")
        return Response(
            inbound_fallback_twiml("All lines are currently busy. Please try again shortly."),
            media_type="application/xml",
        )
    if not provider_ready():
        release_call_capacity_only(call_sid=call_sid, call_session_id=call_session_id)
        with suppress(Exception):
            record_call_interruption(call_session_id,"voice_not_ready")
        msg="The automated service is unavailable."
        return Response(inbound_fallback_twiml(msg),media_type="application/xml")
    _schedule_pending_voice_lease_cleanup(call_sid, call_session_id)
    return Response(inbound_stream_twiml(call_session_id,call_sid),media_type="application/xml")

@app.post("/voice/stream-status")
async def voice_stream_status(request:Request):
    require_public_provider_ingress()
    form=await request.form()
    params=dict(form)
    sig=request.headers.get("X-Twilio-Signature","")
    if not validate_twilio(str(request.url),params,sig):
        raise HTTPException(403,"Invalid Twilio signature")
    record_stream_status(
        str(form.get("CallSid","")),
        str(form.get("StreamSid","")),
        str(form.get("StreamEvent","")),
        str(form.get("StreamError","")),
    )
    return Response(status_code=204)

@app.websocket("/voice/media-stream")
async def voice_media_stream(websocket:WebSocket):
    await handle_provider_media_stream(websocket)

@app.post("/identity/postcode")
async def identity_postcode(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    rid=_positive_int(d.get("resident_id"),"resident_id")
    supplied=_bounded_text(d.get("postcode"),"postcode",required=True,maximum=16)
    with SessionLocal() as s:
        r=s.query(Resident).filter_by(id=rid,client_id=client_id).first()
        if not r:raise HTTPException(404,"Resident not found")
        return {"verified":postcode_matches(r.postcode,supplied)}

@app.post("/controls/ai-side-effects")
async def control_ai_side_effects(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request);enabled=d.get("enabled");reason=_bounded_text(d.get("reason",""),"reason",required=True,maximum=500)
    if not isinstance(enabled,bool):raise HTTPException(400,"enabled must be a boolean")
    if not reason:raise HTTPException(400,"A reason is required")
    if enabled and os.getenv("ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE", "false").lower() != "true":
        raise HTTPException(403,"Remote AI side-effect enable is disabled")
    with SessionLocal() as s:
        set_ai_side_effects(s,enabled,actor=f"client:{client_id}",reason=reason);s.commit()
    return {"enabled":enabled}

@app.post("/safety/clear")
async def safety_clearance(request:Request,client_id=Depends(require_internal_api)):
    d=await _json_object(request)
    try:
        with SessionLocal() as s:
            clear_critical_safety(s,_positive_int(d.get("work_order_id"),"work_order_id"),actor_user_id=_positive_int(d.get("actor_user_id"),"actor_user_id"),reason=_bounded_text(d.get("reason",""),"reason",required=True,maximum=SAFETY_CLEARANCE_REASON_MAX),client_id=client_id)
            s.commit()
    except SafetyStateError as exc:raise HTTPException(409,str(exc))
    return {"cleared":True,"status":"HUMAN_REVIEW"}



@app.post("/pilot/synthetic-email-proof")
async def pilot_synthetic_email_proof(request: Request):
    """Controlled internal completion-email proof. Does not place a Twilio call
    and does not consume the 10-call pilot ceiling. Token-gated only.
    """
    expected = (os.getenv("PILOT_SYNTHETIC_PROOF_TOKEN") or "").strip()
    provided = (request.headers.get("X-Pilot-Proof-Token") or "").strip()
    if not expected or not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(404, "Not found")
    from pilot.runtime_guard import is_pilot_mode_armed
    if not is_pilot_mode_armed():
        raise HTTPException(409, "pilot_not_armed")
    body = {}
    with suppress(Exception):
        body = await _json_object(request)
    marker = _bounded_text(body.get("marker") or f"P0-PROOF-{os.urandom(4).hex()}", "marker", required=True, maximum=64)
    # Build a minimal synthetic call session for chapelgate tenant and dispatch.
    from call_notifications import dispatch_internal_call_email
    from models import Client, Property, TenantBoundary, SessionLocal
    from voice_bridge import create_call_session, close_call_session

    with SessionLocal() as session:
        client = session.query(Client).order_by(Client.id.asc()).first()
        if client is None:
            client = Client(name="Chapelgate synthetic proof")
            session.add(client)
            session.flush()
        if session.query(Property).filter_by(client_id=client.id).first() is None:
            session.add(Property(client_id=client.id, address="Synthetic proof", postcode="CH1 1AA"))
        if session.query(TenantBoundary).filter_by(client_id=client.id).first() is None:
            session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="P0"))
        session.commit()
        client_id = client.id

    call_sid = f"CA-p0-proof-{marker}"[-34:]
    call_id = create_call_session(call_sid, "+440000000998", client_id)
    # Incomplete transcript => CALL REVIEW fallback must still send.
    close_call_session(call_id)
    result = dispatch_internal_call_email(call_id)
    # Wait briefly if email is async
    import time
    time.sleep(1.5)
    from models import CommunicationDelivery
    with SessionLocal() as session:
        rows = (
            session.query(CommunicationDelivery)
            .filter(CommunicationDelivery.provider_reference.isnot(None))
            .order_by(CommunicationDelivery.id.desc())
            .limit(5)
            .all()
        )
        delivery = None
        for row in rows:
            if marker in (row.provider_reference or "") or (row.status or "").upper() == "SENT":
                delivery = row
                break
        if delivery is None and rows:
            delivery = rows[0]
        provider_id = getattr(delivery, "provider_reference", None) if delivery else None
        status = getattr(delivery, "status", None) if delivery else None
    return {
        "ok": True,
        "synthetic": True,
        "pilot_call_consumed": False,
        "call_session_id": call_id,
        "dispatch": {k: result.get(k) for k in ("sent", "category", "provider_reference", "mock") if isinstance(result, dict)},
        "provider_message_id_present": bool(provider_id),
        "delivery_status": status,
        "marker": marker,
    }


@app.get("/readiness")
def readiness_endpoint(_=Depends(require_internal_api)):
    return readiness_report()

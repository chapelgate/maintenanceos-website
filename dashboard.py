import streamlit as st,json
from datetime import datetime
from models import *
from decision_engine import CATEGORIES,TRADE,apply_intake_rules
from operations import *
from sla import sla_status
from security import verify_password
from idempotency import ai_side_effects_enabled,set_ai_side_effects
from readiness import report as readiness_report
from reporting import operational_metrics
from safety_controls import SafetyStateError,clear_critical_safety,critical_safety_active

init_db()
st.set_page_config(page_title="MaintenanceOS V1",layout="wide")

def auth():
    if "uid" in st.session_state:return True
    st.title("MaintenanceOS V1 Pilot")
    e=st.text_input("Email");p=st.text_input("Password",type="password")
    if st.button("Sign in",type="primary"):
        with SessionLocal() as s:
            u=s.query(User).filter_by(email=e,active=True).first()
            if u and verify_password(p,u.password_hash):
                st.session_state.uid=u.id;st.rerun()
        st.error("Invalid login")
    return False
if not auth():st.stop()

with SessionLocal() as s:
    user=s.query(User).filter_by(id=st.session_state.uid).first()
CLIENT=user.client_id
st.sidebar.write(user.email)
if st.sidebar.button("Sign out"):st.session_state.clear();st.rerun()
page=st.sidebar.radio("Navigate",["Command Centre","New Work Order","Work Orders","Approvals","Scheduling","Contractors","Quotes & Invoices","Escalations","Unmatched Reports","Audit","System Health"])

if page=="Command Centre":
    st.title("Command Centre")
    with SessionLocal() as s:
        rows=s.query(WorkOrder).filter_by(client_id=CLIENT).all()
        open_rows=[x for x in rows if x.status not in ("CLOSED","CANCELLED")]
        approvals=s.query(Approval).filter_by(client_id=CLIENT,status="PENDING").count()
        red=s.query(Escalation).join(WorkOrder,Escalation.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT,Escalation.status=="OPEN",Escalation.level=="RED").count()
        closed=[x for x in rows if x.status=="CLOSED"]
        c=st.columns(5)
        c[0].metric("Open jobs",len(open_rows));c[1].metric("Approvals",approvals);c[2].metric("RED escalations",red)
        c[3].metric("Closed jobs",len(closed));c[4].metric("AI/rules managed",sum(1 for x in open_rows if x.status!="HUMAN_REVIEW"))
        data=[]
        for x in open_rows:
            sla,age,target=sla_status(x.urgency,x.created_at)
            data.append({"id":x.id,"urgency":x.urgency,"status":x.status,"trade":x.trade,"contractor":x.assigned_contractor_id,
                         "SLA":sla,"age_min":age,"target_min":target,"description":x.description[:100]})
        st.dataframe(data,hide_index=True,use_container_width=True)
        exceptions=[x for x in open_rows if x.status in {"HUMAN_REVIEW","NO_SHOW","FAILED_CONTRACTOR"} or sla_status(x.urgency,x.created_at)[0]=="BREACHED"]
        st.subheader("Exceptions requiring attention")
        st.dataframe([{"id":x.id,"urgency":x.urgency,"status":x.status,"trade":x.trade,"description":x.description[:120]} for x in exceptions],hide_index=True,use_container_width=True)
    st.subheader("Recorded operational metrics")
    st.json(operational_metrics(CLIENT))

elif page=="New Work Order":
    st.title("New Work Order")
    with SessionLocal() as s:
        props=s.query(Property).filter_by(client_id=CLIENT).all()
        pmap={f"{x.address} ({x.postcode})":x for x in props}
        if not pmap:
            st.warning("No property records are available for this tenant")
            st.stop()
        ps=st.selectbox("Property",list(pmap))
        residents=s.query(Resident).filter_by(client_id=CLIENT,property_id=pmap[ps].id).all()
        rmap={f"{x.name} — {x.email}":x for x in residents}
        rs=st.selectbox("Resident",list(rmap)) if rmap else None
        desc=st.text_area("Problem",height=150)
        if st.button("Create + triage",type="primary") and desc.strip():
            wo=WorkOrder(client_id=CLIENT,property_id=pmap[ps].id,resident_id=rmap[rs].id if rs else None,source="MANUAL",description=desc)
            s.add(wo);s.commit();wid=wo.id
            apply_intake_rules(wid);cid=select_contractor(wid)
            if cid:create_dispatch_approval(wid)
            st.success(f"Work order #{wid} created");st.rerun()

elif page=="Work Orders":
    st.title("Work Orders")
    with SessionLocal() as s:
        rows=s.query(WorkOrder).filter_by(client_id=CLIENT).order_by(WorkOrder.id.desc()).all()
        if rows:
            wid=st.selectbox("Select",[x.id for x in rows],format_func=lambda i:f"#{i} — "+next(x.description for x in rows if x.id==i)[:70])
            w=next(x for x in rows if x.id==wid)
            st.write("**Status:**",w.status," **Urgency:**",w.urgency," **Trade:**",w.trade)
            st.write(w.description)
            if critical_safety_active(s,w.id):
                st.error("Active critical-safety latch. Operational progression and closure are blocked.")
                clearance_reason=st.text_area("Safety clearance evidence",key=f"safety-clear-{w.id}")
                if st.button("Record authorised safety clearance",key=f"clear-{w.id}"):
                    try:
                        clear_critical_safety(s,w.id,actor_user_id=user.id,reason=clearance_reason,client_id=CLIENT)
                        s.commit();st.rerun()
                    except SafetyStateError as exc:st.error(str(exc))
            if w.assigned_contractor_id:
                st.json(contractor_portal_links(w.id))
            if st.button("Recommend contractor"):
                select_contractor(w.id);st.rerun()
            if st.button("Create dispatch approval"):
                create_dispatch_approval(w.id);st.rerun()
            lifecycle_reason=st.text_input("Lifecycle action reason",key=f"lifecycle-{w.id}")
            if w.status=="READY_TO_CLOSE" and st.button("Close work order"):
                if close_work_order(w.id,user.id):st.rerun()
                else:st.error("Closure is blocked")
            if w.status in {"CLOSED","CANCELLED"} and st.button("Reopen work order"):
                if reopen_work_order(w.id,user.id,lifecycle_reason):st.rerun()
                else:st.error("Reopening requires authority and a reason")
            if w.status=="APPOINTMENT_BOOKED" and st.button("Record no-show"):
                if record_no_show(w.id,user.id,lifecycle_reason):st.rerun()
                else:st.error("No-show recording is blocked")
            if w.status not in {"CLOSED","CANCELLED"} and st.button("Cancel work order"):
                if cancel_work_order(w.id,user.id,lifecycle_reason):st.rerun()
                else:st.error("Cancellation requires authority and a reason")

elif page=="Approvals":
    st.title("Approval Queue")
    with SessionLocal() as s:
        rows=s.query(Approval).filter_by(client_id=CLIENT).order_by(Approval.id.desc()).all()
        for a in rows:
            with st.container(border=True):
                st.write(f"**WO #{a.work_order_id} • {a.approval_type} • {a.status}**")
                st.write(a.proposed_action);st.write(a.reason)
                if a.status=="PENDING":
                    decision_reason=st.text_input("Decision reason",key=f"reason-{a.id}")
                    c1,c2=st.columns(2)
                    if c1.button("Approve",key=f"a{a.id}"):
                        if a.approval_type=="TRIAGE":
                            st.error("Use the triage controls below to classify this request")
                        elif approve_operational_action(a.id,user.id,decision_reason):st.rerun()
                        else:st.error("Approval blocked by tenant or safety policy")
                    if c2.button("Reject",key=f"r{a.id}"):
                        if reject_operational_action(a.id,user.id,decision_reason):st.rerun()
                        else:st.error("Rejection blocked by tenant or authority policy")
                    if a.approval_type=="TRIAGE":
                        category=st.selectbox("Category",list(CATEGORIES),key=f"category-{a.id}")
                        urgency=st.selectbox("Urgency",["P2","P3"],key=f"urgency-{a.id}")
                        if st.button("Resolve triage",key=f"triage-{a.id}"):
                            if resolve_triage(a.id,user.id,category,TRADE[category],urgency,decision_reason):st.rerun()
                            else:st.error("Triage resolution requires authority, a reason, and a non-critical classification")

elif page=="Scheduling":
    st.title("Scheduling")
    with SessionLocal() as s:
        av=s.query(ContractorAvailability).join(WorkOrder,ContractorAvailability.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(ContractorAvailability.id.desc()).all()
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"contractor":x.contractor_id,"start":x.slot_start,"end":x.slot_end} for x in av],
                     hide_index=True,use_container_width=True)
        if av:
            aid=st.selectbox("Availability slot",[x.id for x in av])
            if st.button("Book selected slot"):
                chosen=next(x for x in av if x.id==aid)
                book_slot(chosen.work_order_id,chosen.id);st.rerun()
        aps=s.query(Appointment).join(WorkOrder,Appointment.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(Appointment.id.desc()).all()
        st.subheader("Appointments")
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"contractor":x.contractor_id,"start":x.start_at,"end":x.end_at,"status":x.status} for x in aps],
                     hide_index=True,use_container_width=True)

elif page=="Contractors":
    st.title("Contractors")
    with SessionLocal() as s:
        rows=s.query(Contractor).filter_by(client_id=CLIENT).all()
        st.dataframe([{"id":x.id,"name":x.name,"trade":x.trade,"areas":x.postcode_coverage,"rating":x.rating,
                       "acceptance":x.acceptance_rate,"first_time_fix":x.first_time_fix_rate,"response_min":x.avg_response_minutes}
                      for x in rows],hide_index=True,use_container_width=True)

elif page=="Quotes & Invoices":
    st.title("Quotes & Invoices")
    with SessionLocal() as s:
        quotes=s.query(Quote).join(WorkOrder,Quote.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(Quote.id.desc()).all()
        st.subheader("Quotes")
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"contractor":x.contractor_id,"amount":x.amount,"status":x.status,"description":x.description} for x in quotes],
                     hide_index=True,use_container_width=True)
        invoices=s.query(Invoice).join(WorkOrder,Invoice.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(Invoice.id.desc()).all()
        st.subheader("Invoices")
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"number":x.invoice_number,"amount":x.amount,"status":x.status,
                       "anomaly":x.anomaly_score,"reasons":x.anomaly_reasons} for x in invoices],hide_index=True,use_container_width=True)

elif page=="Escalations":
    st.title("Escalations")
    with SessionLocal() as s:
        rows=s.query(Escalation).join(WorkOrder,Escalation.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(Escalation.id.desc()).all()
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"level":x.level,"reason":x.reason,"status":x.status,"created":x.created_at} for x in rows],
                     hide_index=True,use_container_width=True)
        open_rows=[x for x in rows if x.status=="OPEN"]
        if open_rows:
            escalation_id=st.selectbox("Open escalation",[x.id for x in open_rows])
            resolution=st.text_input("Resolution reason")
            if st.button("Resolve escalation"):
                if resolve_escalation(escalation_id,user.id,resolution):st.rerun()
                else:st.error("Resolution is blocked while critical safety remains active or authority is insufficient")

elif page=="Unmatched Reports":
    st.title("Unmatched Reports")
    with SessionLocal() as s:
        rows=s.query(UnmatchedInbound).filter_by(client_id=CLIENT).order_by(UnmatchedInbound.id.desc()).all()
        st.dataframe([{"id":x.id,"channel":x.channel,"report":x.body,"received":x.created_at} for x in rows],hide_index=True,use_container_width=True)

elif page=="Audit":
    st.title("Audit")
    with SessionLocal() as s:
        rows=s.query(AuditEvent).join(WorkOrder,AuditEvent.work_order_id==WorkOrder.id).filter(WorkOrder.client_id==CLIENT).order_by(AuditEvent.id.desc()).limit(1000).all()
        st.dataframe([{"id":x.id,"WO":x.work_order_id,"actor":x.actor,"event":x.event,"detail":x.detail,"time":x.created_at} for x in rows],
                     hide_index=True,use_container_width=True)

elif page=="System Health":
    st.title("System Health")
    checks=readiness_report()
    st.dataframe([{"check":key,"ready":value} for key,value in checks.items()],hide_index=True,use_container_width=True)
    with SessionLocal() as s:
        enabled=ai_side_effects_enabled(s)
        failed_jobs=(s.query(AutomationJob).join(WorkOrder,AutomationJob.work_order_id==WorkOrder.id)
                     .filter(WorkOrder.client_id==CLIENT,AutomationJob.status=="FAILED").count())
        failed_delivery=(s.query(CommunicationDelivery).filter_by(client_id=CLIENT,status="FAILED").count())
        st.metric("AI side effects", "Enabled" if enabled else "Disabled")
        c1,c2=st.columns(2);c1.metric("Failed jobs",failed_jobs);c2.metric("Failed communications",failed_delivery)
        control_reason=st.text_input("Control change reason")
        desired=not enabled
        if st.button("Enable AI side effects" if desired else "Disable AI side effects"):
            if len(control_reason.strip())<5:st.error("A substantive reason is required")
            else:
                set_ai_side_effects(s,desired,actor=f"User:{user.id}",reason=control_reason);s.commit();st.rerun()

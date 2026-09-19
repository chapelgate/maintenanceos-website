from datetime import datetime
from models import *
from sla import sla_status


def _average(values):
    return round(sum(values)/len(values),2) if values else None

def portfolio_kpis(client_id:int):
    with SessionLocal() as s:
        jobs=s.query(WorkOrder).filter_by(client_id=client_id).all()
        total=len(jobs)
        closed=[x for x in jobs if x.status=="CLOSED"]
        open_jobs=[x for x in jobs if x.status not in ("CLOSED","CANCELLED")]
        p1=[x for x in jobs if x.urgency=="P1"]
        repeats=[x for x in jobs if x.repeat_repair]
        breached=sum(1 for x in open_jobs if sla_status(x.urgency,x.created_at)[0]=="BREACHED")
        durations=[(x.closed_at-x.created_at).total_seconds()/3600 for x in closed if x.closed_at]
        return {
          "total_jobs":total,
          "open_jobs":len(open_jobs),
          "closed_jobs":len(closed),
          "p1_jobs":len(p1),
          "repeat_repairs":len(repeats),
          "open_sla_breaches":breached,
          "avg_close_hours":round(sum(durations)/len(durations),2) if durations else None
        }

def contractor_scorecard(client_id:int,contractor_id:int):
    with SessionLocal() as s:
        c=s.query(Contractor).filter_by(id=contractor_id,client_id=client_id).first()
        if not c:return None
        jobs=s.query(WorkOrder).filter_by(client_id=client_id,assigned_contractor_id=contractor_id).all()
        job_ids=[job.id for job in jobs]
        completions=(s.query(CompletionEvidence)
                     .filter(CompletionEvidence.contractor_id==contractor_id,
                             CompletionEvidence.work_order_id.in_(job_ids)).count()) if job_ids else 0
        attempts=s.query(ContractorAttempt).filter_by(client_id=client_id,contractor_id=contractor_id).all()
        unresolved=0
        for j in jobs:
            rc=s.query(ResidentConfirmation).filter_by(work_order_id=j.id).order_by(ResidentConfirmation.id.desc()).first()
            if rc and not rc.resolved: unresolved+=1
        return {
          "contractor":c.name,"trade":c.trade,"jobs_assigned":len(jobs),"completions":completions,
          "unresolved_after_completion":unresolved,"stored_rating":c.rating,
          "acceptance_rate":c.acceptance_rate,"first_time_fix_rate":c.first_time_fix_rate,
          "avg_response_minutes":c.avg_response_minutes,
          "offers":len(attempts),"accepted_offers":sum(1 for item in attempts if item.status=="ACCEPTED"),
          "declined_offers":sum(1 for item in attempts if item.status=="DECLINED"),
          "timed_out_offers":sum(1 for item in attempts if item.status=="TIMED_OUT")
        }


def operational_metrics(client_id:int):
    with SessionLocal() as s:
        jobs=s.query(WorkOrder).filter_by(client_id=client_id).all();job_ids=[job.id for job in jobs]
        audits=(s.query(AuditEvent).filter(AuditEvent.work_order_id.in_(job_ids)).all()) if job_ids else []
        by_job={job.id:[] for job in jobs}
        for event in audits:by_job.setdefault(event.work_order_id,[]).append(event)
        triage_minutes=[];acceptance_minutes=[];appointment_minutes=[];completion_minutes=[]
        for job in jobs:
            events=by_job.get(job.id,[])
            def elapsed(event_names):
                times=[event.created_at for event in events if event.event in event_names and event.created_at]
                return (min(times)-job.created_at).total_seconds()/60 if times and job.created_at else None
            for target,bucket in (
                (("INTAKE_CLASSIFIED",),triage_minutes),
                (("CONTRACTOR_ACCEPT",),acceptance_minutes),
                (("APPOINTMENT_BOOKED",),appointment_minutes),
                (("COMPLETION_SUBMITTED",),completion_minutes),
            ):
                value=elapsed(target)
                if value is not None and value>=0:bucket.append(value)
        approvals=(s.query(Approval).filter_by(client_id=client_id).all())
        turnaround=[
            (item.decided_at-item.created_at).total_seconds()/60 for item in approvals
            if item.decided_at and item.created_at and item.decided_at>=item.created_at
        ]
        open_jobs=[job for job in jobs if job.status not in {"CLOSED","CANCELLED"}]
        overdue=sum(1 for job in open_jobs if sla_status(job.urgency,job.created_at)[0]=="BREACHED")
        escalations=(s.query(Escalation).join(WorkOrder,Escalation.work_order_id==WorkOrder.id)
                     .filter(WorkOrder.client_id==client_id).all())
        jobs_with_human={item.work_order_id for item in approvals}
        jobs_with_human.update(event.work_order_id for event in audits if event.actor.startswith("User:"))
        automation=(s.query(AutomationJob).join(WorkOrder,AutomationJob.work_order_id==WorkOrder.id)
                    .filter(WorkOrder.client_id==client_id).all())
        urgency_distribution={level:sum(1 for job in jobs if job.urgency==level) for level in ("P1","P2","P3")}
        return {
            "requests":len(jobs),"urgency_distribution":urgency_distribution,
            "avg_minutes_to_triage":_average(triage_minutes),
            "avg_minutes_to_contractor_acceptance":_average(acceptance_minutes),
            "avg_minutes_to_appointment":_average(appointment_minutes),
            "avg_minutes_to_completion_submission":_average(completion_minutes),
            "overdue_open_jobs":overdue,
            "repeat_repairs":sum(1 for job in jobs if job.repeat_repair),
            "human_intervention_rate":round(len(jobs_with_human)/len(jobs),4) if jobs else None,
            "human_minutes_per_work_order":None,
            "human_minutes_measurement_available":False,
            "automation_completed":sum(1 for item in automation if item.status=="COMPLETED"),
            "automation_failed":sum(1 for item in automation if item.status=="FAILED"),
            "safety_escalations":sum(1 for item in escalations if item.level=="RED"),
            "open_escalations":sum(1 for item in escalations if item.status=="OPEN"),
            "avg_approval_turnaround_minutes":_average(turnaround),
            "unresolved_exceptions":sum(1 for job in jobs if job.status in {"HUMAN_REVIEW","NO_SHOW","FAILED_CONTRACTOR"}),
            "data_scope":"tenant_recorded_data",
        }

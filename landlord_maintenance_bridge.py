ALLOWED_LANDLORD_STATES = frozenset({
    "INTAKE_RECORDED",
    "REFERENCE_SYNCED",
    "AWAITING_MOS",
    "LANDLORD_CLOSED",
})

SYSTEM_OF_RECORD = "MOS"


class LandlordHandoffError(ValueError):
    pass


def _positive_int(value, field):
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise LandlordHandoffError(f"{field} must be a positive int")
    return value


def build_handoff_payload(*, mos_job_id, property_id, landlord_state="REFERENCE_SYNCED", summary=""):
    job_id = _positive_int(mos_job_id, "mos_job_id")
    prop_id = _positive_int(property_id, "property_id")
    if not isinstance(landlord_state, str) or landlord_state not in ALLOWED_LANDLORD_STATES:
        raise LandlordHandoffError("landlord_state is outside allowed landlordos handoff states")
    if not isinstance(summary, str):
        raise LandlordHandoffError("summary must be a string")
    return {
        "mos_job_id": job_id,
        "property_id": prop_id,
        "landlord_state": landlord_state,
        "system_of_record": SYSTEM_OF_RECORD,
        "triage_owner": SYSTEM_OF_RECORD,
        "dispatch_owner": SYSTEM_OF_RECORD,
        "summary": summary,
    }


def handoff_from_mos_job(job, *, landlord_state="REFERENCE_SYNCED", summary=""):
    if isinstance(job, dict):
        job_id = job.get("id", job.get("work_order_id", job.get("mos_job_id")))
        property_id = job.get("property_id")
    else:
        job_id = getattr(job, "id", None)
        if job_id is None:
            job_id = getattr(job, "work_order_id", None)
        property_id = getattr(job, "property_id", None)
    return build_handoff_payload(
        mos_job_id=job_id,
        property_id=property_id,
        landlord_state=landlord_state,
        summary=summary,
    )

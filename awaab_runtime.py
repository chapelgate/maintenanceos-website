"""Persisted Awaab/social-housing statutory workflow.

The caller must supply explicit jurisdiction, tenure, hazard and trigger facts.
This module never infers legal scope from an address and never lets AI clear a case.
"""
from __future__ import annotations

import json
from datetime import date, datetime

from awaab_policy import (
    AwaabPhase,
    HazardCategory,
    Jurisdiction,
    ReviewState,
    Tenure,
    accommodation_requirement,
    authority_to_clear,
    awaab_phase_for_case,
    emergency_hazard_in_scope,
    emergency_investigation_clock,
    emergency_make_safe_clock,
    significant_hazard_in_scope,
    significant_safety_work_clock,
    standard_investigation_clock,
    written_summary_clock,
    WorkingDayCalendar,
)
from clock import utcnow
from models import AwaabCase, Client, User, WorkOrder


class AwaabRuntimeError(ValueError):
    pass


HUMAN_CLEARANCE_ROLES = frozenset({"admin", "manager", "safety_manager"})


def _case_for_tenant(session, case_id: int, client_id: int) -> AwaabCase:
    case = session.get(AwaabCase, case_id)
    if not case or case.client_id != client_id:
        raise AwaabRuntimeError("case_not_found_for_tenant")
    return case


def _clock_payload(*clocks) -> str:
    return json.dumps(
        [
            {
                "name": clock.name,
                "trigger_at": clock.trigger_at.isoformat(),
                "due_at": clock.due_at.isoformat(),
                "basis": clock.basis,
            }
            for clock in clocks
        ],
        sort_keys=True,
    )


def create_awaab_case(
    session,
    *,
    client_id: int,
    work_order_id: int,
    jurisdiction: Jurisdiction,
    tenure: Tenure,
    hazard_category: HazardCategory,
    case_kind: str,
    trigger_at: datetime,
    evidence_reference: str,
    resident_circumstance_reviewed: bool,
    non_working_dates: frozenset[date],
) -> AwaabCase:
    client = session.get(Client, client_id)
    work_order = session.get(WorkOrder, work_order_id)
    if not client or not work_order or work_order.client_id != client_id:
        raise AwaabRuntimeError("tenant_bound_work_order_required")
    if not isinstance(trigger_at, datetime):
        raise AwaabRuntimeError("trigger_time_required")
    if not isinstance(non_working_dates, frozenset):
        raise AwaabRuntimeError("working_day_calendar_required")
    calendar = WorkingDayCalendar.with_non_working_dates(non_working_dates)
    evidence_reference = (evidence_reference or "").strip()
    if not evidence_reference:
        raise AwaabRuntimeError("evidence_reference_required")

    phase = awaab_phase_for_case(trigger_at, jurisdiction=jurisdiction, tenure=tenure)
    if phase == AwaabPhase.OUT_OF_SCOPE:
        raise AwaabRuntimeError("awaab_policy_out_of_scope")

    kind = (case_kind or "").strip().upper()
    if kind == "SIGNIFICANT":
        if not significant_hazard_in_scope(trigger_at, hazard_category):
            raise AwaabRuntimeError("significant_hazard_out_of_scope_for_phase")
        deadlines = _clock_payload(standard_investigation_clock(trigger_at, calendar))
    elif kind == "EMERGENCY":
        if not emergency_hazard_in_scope(hazard_category):
            raise AwaabRuntimeError("emergency_hazard_out_of_scope")
        deadlines = _clock_payload(emergency_investigation_clock(trigger_at))
    else:
        raise AwaabRuntimeError("case_kind_invalid")

    case = AwaabCase(
        client_id=client_id,
        work_order_id=work_order_id,
        jurisdiction=jurisdiction.value,
        tenure=tenure.value,
        hazard_category=hazard_category.value,
        case_kind=kind,
        phase=phase.value,
        trigger_at=trigger_at,
        resident_circumstance_reviewed=bool(resident_circumstance_reviewed),
        review_state=ReviewState.NEEDS_HUMAN_REVIEW.value,
        status="OPEN",
        deadlines_json=deadlines,
        evidence_reference=evidence_reference,
    )
    session.add(case)
    session.flush()
    return case


def record_investigation_outcome(
    session,
    *,
    case_id: int,
    client_id: int,
    completed_at: datetime,
    relevant_safety_work_identified: bool,
    can_make_safe_within_initial_period: bool,
    evidence_reference: str,
    non_working_dates: frozenset[date],
) -> AwaabCase:
    case = _case_for_tenant(session, case_id, client_id)
    if case.status != "OPEN":
        raise AwaabRuntimeError("case_not_open")
    if not isinstance(completed_at, datetime) or completed_at < case.trigger_at:
        raise AwaabRuntimeError("investigation_completion_invalid")
    evidence_reference = (evidence_reference or "").strip()
    if not evidence_reference:
        raise AwaabRuntimeError("evidence_reference_required")
    if not isinstance(non_working_dates, frozenset):
        raise AwaabRuntimeError("working_day_calendar_required")
    calendar = WorkingDayCalendar.with_non_working_dates(non_working_dates)

    clocks = []
    if case.case_kind == "SIGNIFICANT":
        clocks.append(written_summary_clock(completed_at, calendar))
        if relevant_safety_work_identified:
            clocks.append(significant_safety_work_clock(completed_at, calendar))
    elif case.case_kind == "EMERGENCY":
        if relevant_safety_work_identified:
            clocks.append(emergency_make_safe_clock(completed_at))
    else:
        raise AwaabRuntimeError("stored_case_kind_invalid")

    accommodation = accommodation_requirement(
        can_make_safe_within_initial_period=can_make_safe_within_initial_period
    )
    case.investigation_completed_at = completed_at
    case.deadlines_json = _clock_payload(*clocks)
    case.alternative_accommodation_required = accommodation.required
    case.evidence_reference = evidence_reference
    case.updated_at = utcnow()
    return case


def clear_case(
    session,
    *,
    case_id: int,
    client_id: int,
    actor_user_id: int,
    reason: str,
    evidence_reference: str,
) -> AwaabCase:
    case = _case_for_tenant(session, case_id, client_id)
    user = session.get(User, actor_user_id)
    if not user or not user.active or user.client_id != client_id or user.role not in HUMAN_CLEARANCE_ROLES:
        raise AwaabRuntimeError("authorised_human_required")
    evidence_reference = (evidence_reference or "").strip()
    if not evidence_reference:
        raise AwaabRuntimeError("evidence_reference_required")

    authority = authority_to_clear(actor="AUTHORISED_HUMAN", substantive_reason=reason)
    if authority.decision.value != "CAN_CLEAR_WITH_HUMAN_AUTHORITY":
        raise AwaabRuntimeError(authority.reason)

    case.review_state = authority.review_state.value
    case.status = "CLEARED"
    case.cleared_by_user_id = user.id
    case.clearance_reason = authority.reason
    case.cleared_at = utcnow()
    case.evidence_reference = evidence_reference
    case.updated_at = utcnow()
    return case

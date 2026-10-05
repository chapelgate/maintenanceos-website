from datetime import date, datetime

import pytest

from awaab_policy import (
    AwaabPhase,
    ClearanceDecision,
    HazardCategory,
    Jurisdiction,
    ReviewState,
    SummaryRequirement,
    SupplementaryWorkAction,
    Tenure,
    WorkingDayCalendar,
    accommodation_requirement,
    authority_to_clear,
    awaab_phase,
    awaab_phase_for_case,
    emergency_hazard_in_scope,
    emergency_investigation_clock,
    emergency_make_safe_clock,
    further_investigation_preserves_safety_clock,
    material_change_investigation_clock,
    renewed_investigation_clock,
    significant_hazard_in_scope,
    significant_safety_work_clock,
    standard_investigation_clock,
    supplementary_work_requirement,
    unknown_state,
    written_summary_requirement,
)


def test_policy_case_scope_requires_england_social_rented_sector():
    incident_at = datetime(2026, 11, 30, 9, 0)

    assert (
        awaab_phase_for_case(
            incident_at,
            jurisdiction=Jurisdiction.ENGLAND,
            tenure=Tenure.SOCIAL_RENTED,
        )
        == AwaabPhase.PHASE_2
    )
    assert (
        awaab_phase_for_case(
            incident_at,
            jurisdiction=Jurisdiction.OTHER,
            tenure=Tenure.SOCIAL_RENTED,
        )
        == AwaabPhase.OUT_OF_SCOPE
    )
    assert (
        awaab_phase_for_case(
            incident_at,
            jurisdiction=Jurisdiction.ENGLAND,
            tenure=Tenure.OTHER,
        )
        == AwaabPhase.OUT_OF_SCOPE
    )


def test_phase_boundary_uses_incident_date_without_retroactive_phase_2_logic():
    before_boundary = datetime(2026, 11, 29, 9, 0)
    on_boundary = datetime(2026, 11, 30, 9, 0)

    assert awaab_phase(before_boundary) == AwaabPhase.PHASE_1
    assert awaab_phase(on_boundary) == AwaabPhase.PHASE_2
    assert significant_hazard_in_scope(before_boundary, HazardCategory.DAMP_MOULD)
    assert not significant_hazard_in_scope(before_boundary, HazardCategory.ELECTRICAL)
    assert significant_hazard_in_scope(on_boundary, HazardCategory.ELECTRICAL)


def test_standard_investigation_day_1_is_day_after_awareness_and_skips_non_working_days():
    calendar = WorkingDayCalendar.with_non_working_dates({date(2026, 10, 7)})
    aware_at = datetime(2026, 10, 5, 10, 30)

    clock = standard_investigation_clock(aware_at, calendar)

    assert clock.trigger_at == aware_at
    assert clock.basis == "day_1_is_day_after_awareness"
    assert clock.due_at == datetime(2026, 10, 20, 23, 59, 59, 999999)


def test_emergency_at_first_report_has_24_hour_investigation_clock_and_scope_excludes_overcrowding():
    belief_at = datetime(2026, 10, 5, 8, 15)

    clock = emergency_investigation_clock(belief_at)

    assert clock.due_at == datetime(2026, 10, 6, 8, 15)
    assert emergency_hazard_in_scope(HazardCategory.FIRE_EXPLOSIONS)
    assert not emergency_hazard_in_scope(HazardCategory.OVERCROWDING)


def test_emergency_discovered_during_standard_investigation_starts_own_make_safe_clock():
    awareness_at = datetime(2026, 10, 5, 8, 0)
    discovered_at = datetime(2026, 10, 7, 15, 45)

    standard = standard_investigation_clock(awareness_at)
    emergency = emergency_make_safe_clock(discovered_at)

    assert emergency.due_at == datetime(2026, 10, 8, 15, 45)
    assert emergency.due_at < standard.due_at


def test_significant_finding_creates_five_day_safety_clock_and_three_day_summary_clock():
    completed_at = datetime(2026, 10, 5, 16, 0)

    safety = significant_safety_work_clock(completed_at)
    requirement, summary = written_summary_requirement(completed_at, None)

    assert safety.due_at == datetime(2026, 10, 12, 23, 59, 59, 999999)
    assert requirement == SummaryRequirement.REQUIRED
    assert summary.due_at == datetime(2026, 10, 8, 23, 59, 59, 999999)


def test_make_safe_before_summary_deadline_exempts_summary_but_keeps_clock_for_audit():
    completed_at = datetime(2026, 10, 5, 16, 0)
    repairs_done_at = datetime(2026, 10, 8, 12, 0)

    requirement, summary = written_summary_requirement(completed_at, repairs_done_at)

    assert requirement == SummaryRequirement.EXEMPT_ALL_WORK_COMPLETED
    assert summary.name == "written_summary"
    assert summary.due_at == datetime(2026, 10, 8, 23, 59, 59, 999999)


def test_supplementary_work_steps_due_inside_five_working_days_with_twelve_week_backstop():
    identified_at = datetime(2026, 10, 5, 9, 0)

    requirement = supplementary_work_requirement(
        identified_at,
        can_begin_within_5_working_days=False,
    )

    assert requirement.action == SupplementaryWorkAction.EVIDENCE_STEPS_AND_BACKSTOP
    assert requirement.action_due_at == datetime(2026, 10, 12, 23, 59, 59, 999999)
    assert requirement.backstop_due_at == datetime(2026, 12, 28, 9, 0)
    assert "steps_taken" in requirement.evidence_required


def test_supplementary_work_can_begin_inside_five_working_days_without_backstop():
    requirement = supplementary_work_requirement(
        datetime(2026, 10, 5, 9, 0),
        can_begin_within_5_working_days=True,
    )

    assert requirement.action == SupplementaryWorkAction.BEGIN_WORK
    assert requirement.backstop_due_at is None
    assert requirement.evidence_required == ("actual_start", "evidence")


def test_cannot_make_safe_inside_initial_period_raises_accommodation_path():
    requirement = accommodation_requirement(can_make_safe_within_initial_period=False)

    assert requirement.required
    assert requirement.reason == "cannot_make_safe_within_initial_remediation_period"


def test_renewed_and_material_change_clocks_start_new_deadlines_without_erasing_existing_clock():
    original_safety = significant_safety_work_clock(datetime(2026, 10, 5, 16, 0))
    renewed = renewed_investigation_clock(datetime(2026, 10, 6, 11, 0))
    material = material_change_investigation_clock(datetime(2026, 10, 7, 11, 0))

    assert renewed.name == "renewed_investigation"
    assert renewed.due_at == datetime(2026, 10, 20, 23, 59, 59, 999999)
    assert material.name == "material_change_investigation"
    assert material.due_at == datetime(2026, 10, 21, 23, 59, 59, 999999)
    assert further_investigation_preserves_safety_clock(original_safety) is original_safety


def test_unknown_or_ambiguous_state_remains_review_required():
    assert unknown_state() == ReviewState.UNKNOWN


@pytest.mark.parametrize("actor", ["AI", "CONTRACTOR", "RESIDENT"])
def test_no_ai_or_non_human_auto_clearance_representation(actor):
    authority = authority_to_clear(actor=actor, substantive_reason="Looks resolved")

    assert authority.decision == ClearanceDecision.CANNOT_CLEAR
    assert authority.review_state in {ReviewState.AI_SUGGESTED_ONLY, ReviewState.NEEDS_HUMAN_REVIEW}
    assert authority.reason == "authorised_human_judgement_required"


def test_authorised_human_requires_substantive_reason_to_clear():
    denied = authority_to_clear(actor="AUTHORISED_HUMAN", substantive_reason="ok")
    allowed = authority_to_clear(
        actor="AUTHORISED_HUMAN",
        substantive_reason="Qualified surveyor inspected the evidence and accepted clearance",
    )

    assert denied.decision == ClearanceDecision.CANNOT_CLEAR
    assert allowed.decision == ClearanceDecision.CAN_CLEAR_WITH_HUMAN_AUTHORITY
    assert allowed.review_state == ReviewState.HUMAN_AUTHORISED

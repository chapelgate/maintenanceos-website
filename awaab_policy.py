from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta
from enum import StrEnum
from typing import Callable, Iterable


PHASE_1_START = date(2025, 10, 27)
PHASE_2_START = date(2026, 11, 30)


class AwaabPhase(StrEnum):
    OUT_OF_SCOPE = "OUT_OF_SCOPE"
    PHASE_1 = "PHASE_1"
    PHASE_2 = "PHASE_2"


class Jurisdiction(StrEnum):
    ENGLAND = "ENGLAND"
    OTHER = "OTHER"


class Tenure(StrEnum):
    SOCIAL_RENTED = "SOCIAL_RENTED"
    OTHER = "OTHER"


class HazardCategory(StrEnum):
    DAMP_MOULD = "DAMP_MOULD"
    EXCESS_COLD = "EXCESS_COLD"
    EXCESS_HEAT = "EXCESS_HEAT"
    FALLS = "FALLS"
    STRUCTURAL_COLLAPSE = "STRUCTURAL_COLLAPSE"
    FIRE_EXPLOSIONS = "FIRE_EXPLOSIONS"
    ELECTRICAL = "ELECTRICAL"
    DOMESTIC_PERSONAL_HYGIENE_FOOD_SAFETY = "DOMESTIC_PERSONAL_HYGIENE_FOOD_SAFETY"
    OVERCROWDING = "OVERCROWDING"
    OTHER = "OTHER"


class InvestigationType(StrEnum):
    STANDARD = "STANDARD"
    RENEWED = "RENEWED"
    EMERGENCY = "EMERGENCY"
    FURTHER = "FURTHER"


class ReviewState(StrEnum):
    UNKNOWN = "UNKNOWN"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"
    HUMAN_AUTHORISED = "HUMAN_AUTHORISED"
    AI_SUGGESTED_ONLY = "AI_SUGGESTED_ONLY"


class ClearanceDecision(StrEnum):
    CANNOT_CLEAR = "CANNOT_CLEAR"
    CAN_CLEAR_WITH_HUMAN_AUTHORITY = "CAN_CLEAR_WITH_HUMAN_AUTHORITY"


class SummaryRequirement(StrEnum):
    REQUIRED = "REQUIRED"
    EXEMPT_ALL_WORK_COMPLETED = "EXEMPT_ALL_WORK_COMPLETED"


class SupplementaryWorkAction(StrEnum):
    BEGIN_WORK = "BEGIN_WORK"
    EVIDENCE_STEPS_AND_BACKSTOP = "EVIDENCE_STEPS_AND_BACKSTOP"


PHASE_1_SIGNIFICANT_HAZARDS = frozenset({HazardCategory.DAMP_MOULD})
PHASE_2_SIGNIFICANT_HAZARDS = frozenset(
    {
        HazardCategory.DAMP_MOULD,
        HazardCategory.EXCESS_COLD,
        HazardCategory.EXCESS_HEAT,
        HazardCategory.FALLS,
        HazardCategory.STRUCTURAL_COLLAPSE,
        HazardCategory.FIRE_EXPLOSIONS,
        HazardCategory.ELECTRICAL,
        HazardCategory.DOMESTIC_PERSONAL_HYGIENE_FOOD_SAFETY,
    }
)
EMERGENCY_EXCLUDED_HAZARDS = frozenset({HazardCategory.OVERCROWDING})


@dataclass(frozen=True)
class WorkingDayCalendar:
    non_working_dates: frozenset[date] = field(default_factory=frozenset)
    is_non_working_date: Callable[[date], bool] | None = None

    @classmethod
    def with_non_working_dates(cls, dates: Iterable[date]) -> "WorkingDayCalendar":
        return cls(non_working_dates=frozenset(dates))

    def is_working_day(self, value: date) -> bool:
        if value.weekday() >= 5:
            return False
        if value in self.non_working_dates:
            return False
        if self.is_non_working_date and self.is_non_working_date(value):
            return False
        return True

    def add_working_days_after(self, value: datetime, days: int) -> datetime:
        if days < 1:
            raise ValueError("days must be at least 1")
        current = value.date()
        counted = 0
        while counted < days:
            current += timedelta(days=1)
            if self.is_working_day(current):
                counted += 1
        return datetime.combine(current, time.max)


@dataclass(frozen=True)
class AwaabClock:
    name: str
    trigger_at: datetime
    due_at: datetime
    basis: str


@dataclass(frozen=True)
class SupplementaryWorkRequirement:
    action: SupplementaryWorkAction
    trigger_at: datetime
    action_due_at: datetime
    backstop_due_at: datetime | None
    evidence_required: tuple[str, ...]


@dataclass(frozen=True)
class AccommodationRequirement:
    required: bool
    reason: str


@dataclass(frozen=True)
class ClearanceAuthority:
    decision: ClearanceDecision
    review_state: ReviewState
    reason: str


def policy_applies(jurisdiction: Jurisdiction, tenure: Tenure) -> bool:
    return jurisdiction == Jurisdiction.ENGLAND and tenure == Tenure.SOCIAL_RENTED


def awaab_phase_for_case(
    incident_at: datetime | date,
    *,
    jurisdiction: Jurisdiction,
    tenure: Tenure,
) -> AwaabPhase:
    if not policy_applies(jurisdiction, tenure):
        return AwaabPhase.OUT_OF_SCOPE
    return awaab_phase(incident_at)


def awaab_phase(incident_at: datetime | date) -> AwaabPhase:
    incident_date = (
        incident_at
        if isinstance(incident_at, date) and not isinstance(incident_at, datetime)
        else incident_at.date()
    )
    if incident_date >= PHASE_2_START:
        return AwaabPhase.PHASE_2
    if incident_date >= PHASE_1_START:
        return AwaabPhase.PHASE_1
    return AwaabPhase.OUT_OF_SCOPE


def significant_hazard_in_scope(incident_at: datetime | date, category: HazardCategory) -> bool:
    phase = awaab_phase(incident_at)
    if phase == AwaabPhase.PHASE_1:
        return category in PHASE_1_SIGNIFICANT_HAZARDS
    if phase == AwaabPhase.PHASE_2:
        return category in PHASE_2_SIGNIFICANT_HAZARDS
    return False


def emergency_hazard_in_scope(category: HazardCategory) -> bool:
    return category not in EMERGENCY_EXCLUDED_HAZARDS


def emergency_investigation_clock(belief_at: datetime) -> AwaabClock:
    return AwaabClock(
        name="emergency_investigation",
        trigger_at=belief_at,
        due_at=belief_at + timedelta(hours=24),
        basis="reasonable_grounds_emergency_hazard",
    )


def emergency_make_safe_clock(identified_at: datetime) -> AwaabClock:
    return AwaabClock(
        name="emergency_make_safe",
        trigger_at=identified_at,
        due_at=identified_at + timedelta(hours=24),
        basis="emergency_investigation_identified_relevant_safety_work",
    )


def standard_investigation_clock(awareness_at: datetime, calendar: WorkingDayCalendar | None = None) -> AwaabClock:
    calendar = calendar or WorkingDayCalendar()
    return AwaabClock(
        name="standard_investigation",
        trigger_at=awareness_at,
        due_at=calendar.add_working_days_after(awareness_at, 10),
        basis="day_1_is_day_after_awareness",
    )


def renewed_investigation_clock(request_at: datetime, calendar: WorkingDayCalendar | None = None) -> AwaabClock:
    clock = standard_investigation_clock(request_at, calendar)
    return AwaabClock(
        name="renewed_investigation",
        trigger_at=clock.trigger_at,
        due_at=clock.due_at,
        basis="remote_investigation_followed_by_qualifying_in_person_request",
    )


def material_change_investigation_clock(change_at: datetime, calendar: WorkingDayCalendar | None = None) -> AwaabClock:
    clock = standard_investigation_clock(change_at, calendar)
    return AwaabClock(
        name="material_change_investigation",
        trigger_at=clock.trigger_at,
        due_at=clock.due_at,
        basis="material_change_preserves_prior_history_and_starts_new_clock",
    )


def significant_safety_work_clock(
    investigation_completed_at: datetime,
    calendar: WorkingDayCalendar | None = None,
) -> AwaabClock:
    calendar = calendar or WorkingDayCalendar()
    return AwaabClock(
        name="significant_safety_work",
        trigger_at=investigation_completed_at,
        due_at=calendar.add_working_days_after(investigation_completed_at, 5),
        basis="significant_hazard_relevant_safety_work",
    )


def written_summary_clock(investigation_completed_at: datetime, calendar: WorkingDayCalendar | None = None) -> AwaabClock:
    calendar = calendar or WorkingDayCalendar()
    return AwaabClock(
        name="written_summary",
        trigger_at=investigation_completed_at,
        due_at=calendar.add_working_days_after(investigation_completed_at, 3),
        basis="day_after_investigation_completion",
    )


def written_summary_requirement(
    investigation_completed_at: datetime,
    all_required_work_completed_at: datetime | None,
    calendar: WorkingDayCalendar | None = None,
) -> tuple[SummaryRequirement, AwaabClock]:
    clock = written_summary_clock(investigation_completed_at, calendar)
    if all_required_work_completed_at is not None and all_required_work_completed_at <= clock.due_at:
        return SummaryRequirement.EXEMPT_ALL_WORK_COMPLETED, clock
    return SummaryRequirement.REQUIRED, clock


def supplementary_work_requirement(
    identified_at: datetime,
    *,
    can_begin_within_5_working_days: bool,
    calendar: WorkingDayCalendar | None = None,
) -> SupplementaryWorkRequirement:
    calendar = calendar or WorkingDayCalendar()
    action_due_at = calendar.add_working_days_after(identified_at, 5)
    if can_begin_within_5_working_days:
        return SupplementaryWorkRequirement(
            action=SupplementaryWorkAction.BEGIN_WORK,
            trigger_at=identified_at,
            action_due_at=action_due_at,
            backstop_due_at=None,
            evidence_required=("actual_start", "evidence"),
        )
    return SupplementaryWorkRequirement(
        action=SupplementaryWorkAction.EVIDENCE_STEPS_AND_BACKSTOP,
        trigger_at=identified_at,
        action_due_at=action_due_at,
        backstop_due_at=identified_at + timedelta(weeks=12),
        evidence_required=("reason", "steps_taken", "contractor_material_approval_evidence"),
    )


def accommodation_requirement(*, can_make_safe_within_initial_period: bool) -> AccommodationRequirement:
    if can_make_safe_within_initial_period:
        return AccommodationRequirement(required=False, reason="initial_remediation_period_available")
    return AccommodationRequirement(required=True, reason="cannot_make_safe_within_initial_remediation_period")


def further_investigation_preserves_safety_clock(existing_safety_clock: AwaabClock) -> AwaabClock:
    return existing_safety_clock


def unknown_state() -> ReviewState:
    return ReviewState.UNKNOWN


def authority_to_clear(*, actor: str, substantive_reason: str | None) -> ClearanceAuthority:
    reason = (substantive_reason or "").strip()
    if actor != "AUTHORISED_HUMAN":
        return ClearanceAuthority(
            decision=ClearanceDecision.CANNOT_CLEAR,
            review_state=ReviewState.AI_SUGGESTED_ONLY if actor == "AI" else ReviewState.NEEDS_HUMAN_REVIEW,
            reason="authorised_human_judgement_required",
        )
    if len(reason) < 10:
        return ClearanceAuthority(
            decision=ClearanceDecision.CANNOT_CLEAR,
            review_state=ReviewState.NEEDS_HUMAN_REVIEW,
            reason="substantive_reason_required",
        )
    return ClearanceAuthority(
        decision=ClearanceDecision.CAN_CLEAR_WITH_HUMAN_AUTHORITY,
        review_state=ReviewState.HUMAN_AUTHORISED,
        reason=reason,
    )

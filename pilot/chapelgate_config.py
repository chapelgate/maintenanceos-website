"""Chapelgate-limited pilot mode control plane (Lane A minimal guard).

Does not change the main Chapelgate phone number.
Does not replace voice/greeting/goodbye/email code paths.
Owner approval is recorded; Release Guardian must arm via env to go live.
"""

from __future__ import annotations

import os
from typing import Any

TENANT_ID = "chapelgate"
PILOT_NAME = "chapelgate_10_call_pilot"
MAX_REAL_CALLS = 10
MAIN_NUMBER_CHANGE_ALLOWED = False
FEATURE_FREEZE = True
OWNER_APPROVAL_REQUIRED = True
RELEASE_GUARDIAN_SOLE_ARM = True

# Owner Andy approved 2026-09-18 (recorded on PR #45). Do not re-ask.
OWNER_APPROVAL_RECORDED = True
OWNER_APPROVAL_SOURCE = "PR#45 owner approval confirmed 2026-09-18"

PRESERVED_BEHAVIOURS = {
    "greeting_text": "Hi, thank you for calling. How can we help you today?",
    "call_categories": ("repair", "key", "master_key"),
    "human_escalation": "explicit_request_only",
    "goodbye_markers": ("thank you for calling", "goodbye"),
    "notification_module": "call_notifications",
}

ABORT_CONDITIONS = (
    "application_errors",
    "repeated_email_failure",
    "incorrect_bookings",
    "duplicate_jobs",
    "cross_tenant_leakage",
    "provider_failure_without_safe_fallback",
    "serious_safety_or_policy_failure",
)

SCORECARD_METRICS = (
    "calls_answered",
    "successful_conversations",
    "failed_calls",
    "jobs_correctly_captured",
    "emails_successfully_delivered",
    "appointments_correctly_created",
    "human_interventions",
    "duplicate_actions",
    "latency_ms",
    "caller_abandonment",
    "unresolved_follow_ups",
    "cost_per_call",
    "cost_per_job",
)


def _truthy(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


def chapelgate_pilot_mode_config() -> dict[str, Any]:
    """Authoritative Chapelgate-only PILOT_MODE configuration."""
    rg_armed = _truthy("PILOT_MODE_ARMED")
    owner_ok = OWNER_APPROVAL_RECORDED or _truthy("PILOT_OWNER_APPROVED")
    return {
        "pilot_name": PILOT_NAME,
        "tenant_id": TENANT_ID,
        "enabled": bool(rg_armed and owner_ok),
        "max_real_calls": MAX_REAL_CALLS,
        "calls_completed": 0,  # runtime counter lives in runtime_guard
        "main_chapelgate_number_change_allowed": MAIN_NUMBER_CHANGE_ALLOWED,
        "feature_freeze": FEATURE_FREEZE,
        "owner_approval_required": OWNER_APPROVAL_REQUIRED,
        "owner_approval_recorded": OWNER_APPROVAL_RECORDED,
        "owner_approval_source": OWNER_APPROVAL_SOURCE,
        "release_guardian_sole_arm": RELEASE_GUARDIAN_SOLE_ARM,
        "release_guardian_armed": rg_armed,
        "preserved_behaviours": dict(PRESERVED_BEHAVIOURS),
        "abort_conditions": list(ABORT_CONDITIONS),
        "scorecard_metrics": list(SCORECARD_METRICS),
        "side_effects": {
            "ai_side_effects_default": False,
            "email_notifications": "call_notifications_via_email_gateway",
            "calendar": "estate_or_adapter_with_provider_event_id",
            "crm_external": "internal_work_order_only",
            "healthcare_regulatory_enablement": False,
        },
        "routing": {
            "do_not_retarget_main_number": True,
            "arm_env": "PILOT_MODE_ARMED=true",
        },
        "release_eligibility": False,
    }


def pilot_armed(*, owner_approved: bool | None = None, release_guardian_armed: bool | None = None) -> bool:
    """Pilot is live only when owner approved AND RG armed the flag."""
    owner = (
        OWNER_APPROVAL_RECORDED
        if owner_approved is None
        else bool(owner_approved)
    )
    rg = _truthy("PILOT_MODE_ARMED") if release_guardian_armed is None else bool(release_guardian_armed)
    return bool(owner) and bool(rg)

"""Automatic PILOT ABORT evaluators for the Chapelgate 10-call pilot.

Library-only: never tears down Lane A telephony from this module.
"""

from __future__ import annotations

from typing import Any, Mapping

from pilot.chapelgate_config import ABORT_CONDITIONS, TENANT_ID


class PilotAbortError(ValueError):
    def __init__(self, reason: str, reason_code: str | None = None) -> None:
        self.reason = reason
        self.reason_code = reason_code or reason
        super().__init__(f"pilot abort: {reason}")


def evaluate_pilot_abort(signals: Mapping[str, Any] | None) -> dict[str, Any]:
    """Evaluate abort conditions. Fail closed on serious signals."""
    data = dict(signals or {})
    tenant = str(data.get("tenant_id") or "").strip()
    if tenant and tenant != TENANT_ID:
        return {
            "abort": True,
            "reason_code": "cross_tenant_leakage",
            "triggered": ["cross_tenant_leakage"],
            "action": "PILOT_ABORT",
            "lane_a_auto_promote": False,
            "requires_release_guardian_to_clear": True,
        }

    triggered: list[str] = []
    if bool(data.get("application_errors")):
        triggered.append("application_errors")
    if int(data.get("email_failures_consecutive") or 0) >= 2:
        triggered.append("repeated_email_failure")
    if bool(data.get("incorrect_bookings")) or int(data.get("incorrect_bookings") or 0) > 0:
        triggered.append("incorrect_bookings")
    if bool(data.get("duplicate_jobs")) or int(data.get("duplicate_jobs") or 0) > 0:
        triggered.append("duplicate_jobs")
    if bool(data.get("cross_tenant_leakage")):
        triggered.append("cross_tenant_leakage")
    if bool(data.get("provider_failure_no_fallback")) or bool(
        data.get("provider_failure_without_safe_fallback")
    ):
        triggered.append("provider_failure_without_safe_fallback")
    if bool(data.get("serious_safety_or_policy_failure")):
        triggered.append("serious_safety_or_policy_failure")

    triggered = [t for t in triggered if t in ABORT_CONDITIONS]
    abort = bool(triggered)
    return {
        "abort": abort,
        "reason_code": triggered[0] if triggered else "ok",
        "triggered": triggered,
        "action": "PILOT_ABORT" if abort else "CONTINUE",
        "lane_a_auto_promote": False,
        "requires_release_guardian_to_clear": abort,
    }


def assert_not_aborted(signals: Mapping[str, Any] | None) -> dict[str, Any]:
    result = evaluate_pilot_abort(signals)
    if result.get("abort"):
        raise PilotAbortError(str(result.get("reason_code")), str(result.get("reason_code")))
    return result

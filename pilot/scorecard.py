"""PILOT SCORECARD for the Chapelgate 10-call limited pilot."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping

from pilot.chapelgate_config import SCORECARD_METRICS, TENANT_ID


def _utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@dataclass
class PilotScorecard:
    tenant_id: str = TENANT_ID
    calls_answered: int = 0
    successful_conversations: int = 0
    failed_calls: int = 0
    jobs_correctly_captured: int = 0
    emails_successfully_delivered: int = 0
    appointments_correctly_created: int = 0
    human_interventions: int = 0
    duplicate_actions: int = 0
    latency_ms_total: float = 0.0
    latency_samples: int = 0
    caller_abandonment: int = 0
    unresolved_follow_ups: int = 0
    cost_usd_total: float = 0.0
    updated_at: str = field(default_factory=_utcnow)

    def record_latency_ms(self, latency_ms: float) -> None:
        self.latency_ms_total += float(latency_ms)
        self.latency_samples += 1
        self.updated_at = _utcnow()

    def average_latency_ms(self) -> float | None:
        if self.latency_samples <= 0:
            return None
        return self.latency_ms_total / self.latency_samples

    def cost_per_call(self) -> float | None:
        answered = max(self.calls_answered, 0)
        if answered <= 0:
            return None
        return self.cost_usd_total / answered

    def cost_per_job(self) -> float | None:
        jobs = max(self.jobs_correctly_captured, 0)
        if jobs <= 0:
            return None
        return self.cost_usd_total / jobs

    def to_dict(self) -> dict[str, Any]:
        row = asdict(self)
        row["latency_ms"] = self.average_latency_ms()
        row["cost_per_call"] = self.cost_per_call()
        row["cost_per_job"] = self.cost_per_job()
        row["metrics"] = list(SCORECARD_METRICS)
        return row


def empty_scorecard() -> PilotScorecard:
    return PilotScorecard()


def apply_scorecard_event(card: PilotScorecard, event: Mapping[str, Any]) -> PilotScorecard:
    """Apply one redacted pilot event. Unknown keys ignored."""
    kind = str(event.get("kind") or "").strip()
    if kind == "call_answered":
        card.calls_answered += 1
    elif kind == "conversation_success":
        card.successful_conversations += 1
    elif kind == "call_failed":
        card.failed_calls += 1
    elif kind == "job_captured":
        card.jobs_correctly_captured += 1
    elif kind == "email_delivered":
        card.emails_successfully_delivered += 1
    elif kind == "appointment_created":
        card.appointments_correctly_created += 1
    elif kind == "human_intervention":
        card.human_interventions += 1
    elif kind == "duplicate_action":
        card.duplicate_actions += 1
    elif kind == "abandonment":
        card.caller_abandonment += 1
    elif kind == "unresolved_follow_up":
        card.unresolved_follow_ups += 1
    if "latency_ms" in event:
        card.record_latency_ms(float(event["latency_ms"]))
    if "cost_usd" in event:
        card.cost_usd_total += float(event["cost_usd"])
        card.updated_at = _utcnow()
    return card

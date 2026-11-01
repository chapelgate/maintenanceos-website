"""Pure tenant-scoped data lifecycle decision primitives.

This module deliberately contains no persistence, scheduler, or deletion side effects.
Callers must supply retention durations, holds, and preservation classes explicitly.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable, Mapping


class LifecyclePolicyError(ValueError):
    pass


class TenantLifecycleError(ValueError):
    pass


@dataclass(frozen=True)
class LifecycleRecord:
    client_id: int
    data_class: str
    record_id: str
    reference_at: datetime
    subject_id: str | None = None


@dataclass(frozen=True)
class LifecycleHold:
    client_id: int
    scope: str
    scope_id: str
    active: bool = True


@dataclass(frozen=True)
class LifecyclePolicy:
    retention: Mapping[str, timedelta]
    preserve_classes: frozenset[str] = frozenset()

    def duration_for(self, data_class: str) -> timedelta:
        if data_class not in self.retention:
            raise LifecyclePolicyError(f"retention_missing:{data_class}")
        value = self.retention[data_class]
        if not isinstance(value, timedelta) or value <= timedelta(0):
            raise LifecyclePolicyError(f"retention_invalid:{data_class}")
        return value


@dataclass(frozen=True)
class LifecycleDecision:
    client_id: int
    data_class: str
    record_id: str
    action: str
    reason: str


_ALLOWED_HOLD_SCOPES = frozenset({"tenant", "record", "subject", "data_class"})
_ALLOWED_ACTIONS = frozenset({"export", "erasure"})


def hold_scope_known(scope: str) -> bool:
    value = (scope or "").strip()
    if not value or any(ord(ch) < 32 for ch in value):
        return False
    return value in _ALLOWED_HOLD_SCOPES


def action_known(action: str) -> bool:
    value = (action or "").strip()
    if not value or any(ord(ch) < 32 for ch in value):
        return False
    return value in _ALLOWED_ACTIONS


def _validate_record(record: LifecycleRecord, client_id: int) -> None:
    if client_id <= 0:
        raise TenantLifecycleError("tenant_required")
    if record.client_id != client_id:
        raise TenantLifecycleError("cross_tenant_record")
    if not record.data_class.strip() or not str(record.record_id).strip():
        raise LifecyclePolicyError("record_identity_required")
    if not isinstance(record.reference_at, datetime):
        raise LifecyclePolicyError("record_reference_time_required")


def _active_hold(record: LifecycleRecord, holds: Iterable[LifecycleHold], client_id: int) -> bool:
    for hold in holds:
        if not hold.active:
            continue
        if hold.client_id != client_id:
            continue
        if hold.scope not in _ALLOWED_HOLD_SCOPES:
            raise LifecyclePolicyError(f"hold_scope_invalid:{hold.scope}")
        if hold.scope == "tenant":
            return True
        if hold.scope == "record" and hold.scope_id == str(record.record_id):
            return True
        if hold.scope == "subject" and record.subject_id is not None and hold.scope_id == record.subject_id:
            return True
        if hold.scope == "data_class" and hold.scope_id == record.data_class:
            return True
    return False


def plan_lifecycle(
    records: Iterable[LifecycleRecord],
    *,
    client_id: int,
    action: str,
    policy: LifecyclePolicy,
    now: datetime,
    holds: Iterable[LifecycleHold] = (),
) -> tuple[LifecycleDecision, ...]:
    """Return a deterministic side-effect-free lifecycle plan."""
    if action not in _ALLOWED_ACTIONS:
        raise LifecyclePolicyError(f"action_invalid:{action}")
    if not isinstance(now, datetime):
        raise LifecyclePolicyError("now_required")

    materialised = tuple(records)
    for record in materialised:
        _validate_record(record, client_id)

    ordered = sorted(materialised, key=lambda item: (item.data_class, str(item.record_id)))
    decisions: list[LifecycleDecision] = []

    for record in ordered:
        if action == "export":
            decisions.append(
                LifecycleDecision(client_id, record.data_class, str(record.record_id), "export", "tenant_scoped_export")
            )
            continue

        duration = policy.duration_for(record.data_class)
        expired = record.reference_at + duration <= now
        if not expired:
            decisions.append(
                LifecycleDecision(client_id, record.data_class, str(record.record_id), "retain", "retention_not_expired")
            )
            continue
        if _active_hold(record, holds, client_id):
            decisions.append(
                LifecycleDecision(client_id, record.data_class, str(record.record_id), "retain", "active_hold")
            )
            continue
        if record.data_class in policy.preserve_classes:
            decisions.append(
                LifecycleDecision(
                    client_id,
                    record.data_class,
                    str(record.record_id),
                    "preserve_minimal",
                    "preservation_class",
                )
            )
            continue
        decisions.append(
            LifecycleDecision(client_id, record.data_class, str(record.record_id), "erase", "retention_expired")
        )

    return tuple(decisions)

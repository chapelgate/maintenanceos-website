"""Per-door maintenance job management for housing cases.

Adapted from Pango (https://github.com/vul-os/pango), commit ba1e085.
Original: backend/internal/domain/ (unit normalisation) and maintenance job management.
Licence: MIT OR Apache-2.0 (commercially compatible; reuse with attribution).
Chapelgate implementation is a clean-room Python functional reimplementation:
no copied code, schemas, identifiers, strings, test data or text.
"""


from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import Enum, auto
from typing import Optional, Dict, Any, List


class Priority(Enum):
    LOW = auto()
    MEDIUM = auto()
    HIGH = auto()
    URGENT = auto()


class Status(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CLOSED = "closed"
    CANCELLED = "cancelled"


@dataclass
class MaintenanceJobDraft:
    """Draft version of a maintenance job before it is created."""

    org_id: str
    unit_id: str
    title: str
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    scheduled_for: Optional[datetime] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    contractor_id: Optional[str] = None
    assigned_to_id: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None


@dataclass
class MaintenanceJob:
    """A maintenance job attached to a specific unit."""

    id: str
    org_id: str
    unit_id: str
    title: str
    description: str
    priority: Priority
    status: Status
    scheduled_for: datetime
    estimated_cost: float
    actual_cost: float
    contractor_id: Optional[str]
    assigned_to_id: Optional[str]
    hlc: str
    deleted: bool
    created_at: datetime


# In-memory store for jobs (orgId-scoped)
_jobs: Dict[str, Dict[str, MaintenanceJob]] = {}  # org_id -> {job_id: job}


def _next_job_id() -> str:
    """Generate a simple job ID."""
    import uuid
    return str(uuid.uuid4())[:8]


def create_job(draft: MaintenanceJobDraft) -> MaintenanceJob:
    """Create a new maintenance job from a draft.

    The job is stored orgId-scoped; only the organising org can see/access it.
    """
    job_id = _next_job_id()
    now = datetime.now(UTC)

    job = MaintenanceJob(
        id=job_id,
        org_id=draft.org_id,
        unit_id=draft.unit_id,
        title=draft.title,
        description=draft.description or "",
        priority=draft.priority or Priority.MEDIUM,
        status=draft.status or Status.OPEN,
        scheduled_for=draft.scheduled_for or now,
        estimated_cost=draft.estimated_cost if draft.estimated_cost is not None else 0.0,
        actual_cost=draft.actual_cost if draft.actual_cost is not None else 0.0,
        contractor_id=draft.contractor_id,
        assigned_to_id=draft.assigned_to_id,
        hlc=now.isoformat(),
        deleted=False,
        created_at=now,
    )

    if draft.org_id not in _jobs:
        _jobs[draft.org_id] = {}
    _jobs[draft.org_id][job_id] = job

    return job


def list_jobs(
    org_id: str,
    unit_id: Optional[str] = None,
    status: Optional[Status] = None,
    priority: Optional[Priority] = None,
) -> List[MaintenanceJob]:
    """List jobs for an org, optionally filtered by unit_id, status, or priority."""
    org_jobs = list(_jobs.get(org_id, {}).values())
    if unit_id is not None:
        org_jobs = [j for j in org_jobs if j.unit_id == unit_id]
    if status is not None:
        org_jobs = [j for j in org_jobs if j.status == status]
    if priority is not None:
        org_jobs = [j for j in org_jobs if j.priority == priority]
    return org_jobs


def get_job(org_id: str, job_id: str) -> Optional[MaintenanceJob]:
    """Get a specific job by org_id and job_id."""
    return _jobs.get(org_id, {}).get(job_id)


def update_job_status(
    org_id: str,
    job_id: str,
    new_status: Status,
) -> MaintenanceJob:
    """Update the status of a job. Only valid transitions allowed."""
    job = get_job(org_id, job_id)
    if job is None:
        raise ValueError(f"Job {job_id} not found in org {org_id}")

    # Define allowed transitions
    allowed_transitions = {
        Status.OPEN: {Status.IN_PROGRESS, Status.ON_HOLD, Status.CLOSED, Status.CANCELLED},
        Status.IN_PROGRESS: {Status.ON_HOLD, Status.COMPLETED, Status.CANCELLED},
        Status.ON_HOLD: {Status.IN_PROGRESS, Status.COMPLETED, Status.CANCELLED},
        Status.COMPLETED: set(),  # terminal
        Status.CLOSED: set(),  # terminal
        Status.CANCELLED: set(),  # terminal
    }

    if new_status not in allowed_transitions[job.status]:
        raise ValueError(
            f"Invalid transition: {job.status.value} -> {new_status.value}"
        )

    job.status = new_status
    return job


def update_job_costs(
    org_id: str,
    job_id: str,
    estimated_cost: Optional[float] = None,
    actual_cost: Optional[float] = None,
) -> MaintenanceJob:
    """Update the cost fields of a job."""
    job = get_job(org_id, job_id)
    if job is None:
        raise ValueError(f"Job {job_id} not found in org {org_id}")

    if estimated_cost is not None:
        job.estimated_cost = estimated_cost
    if actual_cost is not None:
        job.actual_cost = actual_cost

    return job


def delete_job(org_id: str, job_id: str) -> None:
    """Soft-delete a job (mark as deleted)."""
    job = get_job(org_id, job_id)
    if job is None:
        raise ValueError(f"Job {job_id} not found in org {org_id}")
    job.deleted = True


# Cost aggregation: summarise costs per unit across all jobs in an org
def cost_summary(org_id: str) -> Dict[str, Dict[str, Any]]:
    """Return cost summary aggregated per unit for an org.

    Returns dict: unit_id -> {
        "estimated_cost": float,
        "actual_cost": float,
        "job_count": int,
        "last_job_at": datetime or None,
    }
    """
    units: Dict[str, Dict[str, Any]] = {}

    org_jobs = list(_jobs.get(org_id, {}).values())
    for job in org_jobs:
        uj = units.setdefault(job.unit_id, {
            "estimated_cost": 0.0,
            "actual_cost": 0.0,
            "job_count": 0,
            "last_job_at": None,
        })
        uj["estimated_cost"] += job.estimated_cost
        uj["actual_cost"] += job.actual_cost
        uj["job_count"] += 1
        if uj["last_job_at"] is None or job.created_at > uj["last_job_at"]:
            uj["last_job_at"] = job.created_at

    return units


__all__ = [
    "MaintenanceJobDraft",
    "MaintenanceJob",
    "Priority",
    "Status",
    "create_job",
    "list_jobs",
    "get_job",
    "update_job_status",
    "update_job_costs",
    "delete_job",
    "cost_summary",
    "reset_job_store",
]


def reset_job_store() -> None:
    """Reset the in-memory job store for testing."""
    global _jobs
    _jobs = {}
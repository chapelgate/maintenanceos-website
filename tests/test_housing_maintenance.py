"""Housing maintenance job tests."""

import pytest
from datetime import datetime

from pilot.housing.maintenance_jobs import (
    MaintenanceJobDraft,
    MaintenanceJob,
    Priority,
    Status,
    create_job,
    list_jobs,
    get_job,
    update_job_status,
    update_job_costs,
    delete_job,
    cost_summary,
    reset_job_store,
)


@pytest.fixture(autouse=True)
def _reset_store():
    reset_job_store()


def test_job_created_for_unit_attributes_cost_to_unit():
    draft = MaintenanceJobDraft(
        org_id="orgA",
        unit_id="3a",
        title="Test job",
        estimated_cost=150.0,
    )
    job = create_job(draft)
    fetched = get_job("orgA", job.id)
    assert fetched is not None
    assert fetched.unit_id == "3a"
    assert fetched.estimated_cost == 150.0


def test_job_list_displays_per_unit_cost_breakdown():
    # Create two jobs on the same unit
    draft1 = MaintenanceJobDraft(
        org_id="orgA", unit_id="3a", title="Job 1", estimated_cost=100.0
    )
    draft2 = MaintenanceJobDraft(
        org_id="orgA", unit_id="3a", title="Job 2", estimated_cost=200.0
    )
    create_job(draft1)
    create_job(draft2)

    summary = cost_summary("orgA")
    assert summary["3a"]["actual_cost"] == 0.0
    assert summary["3a"]["estimated_cost"] == 300.0
    assert summary["3a"]["job_count"] == 2


def test_status_transitions_persisted_and_viewable():
    reset_job_store()
    draft = MaintenanceJobDraft(
        org_id="orgA", unit_id="3a", title="Test job", status=Status.OPEN
    )
    job = create_job(draft)
    # open -> in_progress
    update_job_status("orgA", job.id, Status.IN_PROGRESS)
    fetched = get_job("orgA", job.id)
    assert fetched.status == Status.IN_PROGRESS
    # in_progress -> completed
    update_job_status("orgA", job.id, Status.COMPLETED)
    fetched = get_job("orgA", job.id)
    assert fetched.status == Status.COMPLETED


def test_total_maintenance_cost_per_unit_aggregates():
    # Create multiple jobs across units
    for unit in ["1", "2", "1"]:
        draft = MaintenanceJobDraft(
            org_id="orgA", unit_id=unit, title=f"Job {unit}", estimated_cost=50.0
        )
        create_job(draft)

    summary = cost_summary("orgA")
    assert summary["1"]["estimated_cost"] == 100.0
    assert summary["2"]["estimated_cost"] == 50.0
    assert summary["1"]["job_count"] == 2
    assert summary["2"]["job_count"] == 1


def test_org_isolation_no_cross_org_visibility():
    # Create job under orgA
    draft = MaintenanceJobDraft(
        org_id="orgA", unit_id="3a", title="OrgA job", estimated_cost=50.0
    )
    create_job(draft)

    # Query under orgB - should return nothing
    org_b_jobs = list_jobs("orgB")
    assert len(org_b_jobs) == 0
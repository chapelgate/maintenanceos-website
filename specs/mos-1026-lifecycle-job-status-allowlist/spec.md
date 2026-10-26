# mos-1026-lifecycle-job-status-allowlist: lifecycle jobs stay on PENDING/RUNNING/COMPLETED/FAILED

## Goal
queue_retention_sweep only enqueues AutomationJob rows whose status is in VALID_LIFECYCLE_JOB_STATUSES={PENDING,RUNNING,COMPLETED,FAILED}, and queue writes PENDING only. Unknown statuses fail closed before write.

## Acceptance
- `tests/test_lifecycle_job_status_allowlist.py::test_valid_lifecycle_job_statuses_known_set` passes.
- `tests/test_lifecycle_job_status_allowlist.py::test_queue_retention_sweep_writes_pending_status` passes.
- `tests/test_lifecycle_job_status_allowlist.py::test_queue_rejects_unknown_lifecycle_job_status` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

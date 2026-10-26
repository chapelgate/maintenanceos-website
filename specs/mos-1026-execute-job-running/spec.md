# mos-1026-execute-job-running: execute refuses non-RUNNING lifecycle jobs

## Goal
`execute_lifecycle_sweep` refuses AutomationJob rows whose status is not RUNNING before payload parse or mutation. PENDING, COMPLETED, FAILED, or missing status cannot drive a sweep outside the worker claim path.

## Acceptance
- `tests/test_execute_job_running.py::test_execute_requires_running_status` passes.
- `tests/test_execute_job_running.py::test_execute_rejects_pending_job` passes.
- `tests/test_execute_job_running.py::test_execute_rejects_completed_job` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1026-lifecycle-job-type-allowlist: lifecycle jobs stay on DATA_LIFECYCLE_SWEEP

## Goal
queue_retention_sweep only enqueues AutomationJob rows whose job_type is in VALID_LIFECYCLE_JOB_TYPES={DATA_LIFECYCLE_SWEEP}. Unknown types fail closed before write.

## Acceptance
- `tests/test_lifecycle_job_type_allowlist.py::test_valid_lifecycle_job_types_known_set` passes.
- `tests/test_lifecycle_job_type_allowlist.py::test_queue_retention_sweep_writes_allowed_job_type` passes.
- `tests/test_lifecycle_job_type_allowlist.py::test_queue_rejects_unknown_lifecycle_job_type` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1026-lifecycle-job-type-execute: execute refuses non-DATA_LIFECYCLE_SWEEP jobs

## Goal
execute_lifecycle_sweep only accepts AutomationJob rows whose job_type is in VALID_LIFECYCLE_JOB_TYPES={DATA_LIFECYCLE_SWEEP}. Unknown types fail closed before payload parse or apply.

## Acceptance
- `tests/test_lifecycle_job_type_execute.py::test_valid_lifecycle_job_types_known_set` passes.
- `tests/test_lifecycle_job_type_execute.py::test_execute_accepts_data_lifecycle_sweep` passes.
- `tests/test_lifecycle_job_type_execute.py::test_execute_rejects_unknown_job_type` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

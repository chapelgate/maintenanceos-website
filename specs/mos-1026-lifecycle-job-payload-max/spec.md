# mos-1026-lifecycle-job-payload-max: lifecycle job payloads stay at most 2000 characters

## Goal
queue_retention_sweep refuses AutomationJob payloads longer than LIFECYCLE_JOB_PAYLOAD_MAX=2000 before write.

## Acceptance
- `tests/test_lifecycle_job_payload_max.py::test_lifecycle_job_payload_max_known` passes.
- `tests/test_lifecycle_job_payload_max.py::test_queue_retention_sweep_writes_bounded_payload` passes.
- `tests/test_lifecycle_job_payload_max.py::test_queue_rejects_oversized_lifecycle_job_payload` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

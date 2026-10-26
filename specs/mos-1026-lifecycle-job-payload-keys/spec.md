# mos-1026-lifecycle-job-payload-keys: lifecycle job payloads stay on client_id and request_id

## Goal
queue_retention_sweep and execute_lifecycle_sweep only accept AutomationJob payload objects whose keys are exactly VALID_LIFECYCLE_JOB_PAYLOAD_KEYS={client_id,request_id}. Unknown or missing keys fail closed.

## Acceptance
- `tests/test_lifecycle_job_payload_keys.py::test_valid_lifecycle_job_payload_keys_known_set` passes.
- `tests/test_lifecycle_job_payload_keys.py::test_queue_retention_sweep_writes_exact_payload_keys` passes.
- `tests/test_lifecycle_job_payload_keys.py::test_execute_rejects_unknown_lifecycle_job_payload_keys` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

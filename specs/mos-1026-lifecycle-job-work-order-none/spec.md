# mos-1026-lifecycle-job-work-order-none: lifecycle sweep jobs stay unbound from work orders

## Goal
queue_retention_sweep only enqueues AutomationJob rows with work_order_id equal to LIFECYCLE_JOB_WORK_ORDER_ID=None, and execute_lifecycle_sweep refuses any job whose work_order_id is not None.

## Acceptance
- `tests/test_lifecycle_job_work_order_none.py::test_lifecycle_job_work_order_id_is_none` passes.
- `tests/test_lifecycle_job_work_order_none.py::test_queue_retention_sweep_writes_null_work_order` passes.
- `tests/test_lifecycle_job_work_order_none.py::test_execute_rejects_bound_work_order` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

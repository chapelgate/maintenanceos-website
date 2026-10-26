# Plan

1. Keep the four fail-closed tests in `tests/test_lifecycle_fail_closed.py`.
2. Import only `commercial_release_controls` and `lifecycle_runtime`.
3. Do not set a retention duration and do not make `data_lifecycle_runtime_ready` return true.
4. Add this Spec Kit artifact so Estate Gate can see the FEATURE route is converged.

Rollback: delete `tests/test_lifecycle_fail_closed.py` and `specs/mos-03-lifecycle-fail-closed/`.

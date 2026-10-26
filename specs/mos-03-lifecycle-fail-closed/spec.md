# mos-03-lifecycle-fail-closed: Lock commercial lifecycle readiness false

## Goal
Stop a later change from claiming commercial lifecycle readiness while `data_lifecycle_runtime_ready()` is hard-false, or while `contractor_profile`, `user_account`, and `backup_copy` have no runtime.

## Acceptance
- `tests/test_lifecycle_fail_closed.py::test_lifecycle_runtime_flag_stays_false` asserts the runtime flag is false.
- `tests/test_lifecycle_fail_closed.py::test_three_required_classes_have_no_runtime` asserts those three classes are required and unsupported.
- `tests/test_lifecycle_fail_closed.py::test_unsupported_class_raises` asserts `_records_for_class` raises `LifecycleRuntimeError` before querying.
- `tests/test_lifecycle_fail_closed.py::test_retention_policy_still_has_no_defaults` asserts a blank `DATA_RETENTION_POLICY_JSON` returns no policy.

## Safety boundary
- Licence route: NONE. New tests only.
- No change to `commercial_release_controls.py`, `lifecycle_runtime.py`, retention durations, voice, deploy, or frozen paths.
- The runtime flag stays false. No committed retention duration.

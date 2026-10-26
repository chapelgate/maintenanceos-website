# mos-1026-release-hold-active-required: release_hold refuses already-released holds

## Goal
`release_hold` raises `LifecycleRuntimeError("hold_already_released")` when attempting to release a hold that is already inactive.

## Acceptance
- `tests/test_release_hold_active_required.py::test_release_refuses_inactive_hold` passes.
- `tests/test_release_hold_active_required.py::test_release_active_hold_succeeds` passes.
- `tests/test_release_hold_active_required.py::test_release_other_tenant_hold_fails` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

# mos-1027-at39-close-raises

## Goal
Restore fail-closed close_work_order behaviour: SafetyStateError from require_noncritical must propagate so AT39 (unresolved critical case cannot close) holds. Unauthorised roles still return False via LIFECYCLE_ROLES.

## Acceptance
- tests/test_acceptance_local.py::test_at39_unresolved_critical_case_cannot_progress_or_close passes
- tests/test_close_lifecycle_roles.py passes
- close_work_order source has no `except SafetyStateError:return False`
- dashboard Close path catches SafetyStateError and shows an error (no crash)

## Out of scope
safety_controls.py (frozen), cancel/reopen catch behaviour, voice/deploy/secrets.

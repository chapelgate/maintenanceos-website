# Plan

1. Add `tests/test_scope_does_not_release.py`.
2. Call `readiness.report()` with the non-social scope, the social-housing scope, and no scope.
3. Assert `commercial_release_ready` is false in each case, and that social housing stays false.
4. Do not change `readiness.py` or `commercial_release_controls.py`.

Rollback: delete `tests/test_scope_does_not_release.py` and `specs/mos-1025-scope-not-release/`.

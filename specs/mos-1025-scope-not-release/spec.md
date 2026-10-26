# mos-1025-scope-not-release: Market scope does not open commercial release

## Goal
Prove that setting the England non-social market, the social-housing market, or leaving the market unset leaves `commercial_release_ready` false.

## Acceptance
- `tests/test_scope_does_not_release.py::test_non_social_scope_does_not_make_commercial_release_ready` passes.
- `tests/test_scope_does_not_release.py::test_social_housing_scope_stays_closed` passes.
- `tests/test_scope_does_not_release.py::test_unset_scope_stays_closed` passes.
- No runtime flag is turned on. Lifecycle runtime and external-identity runtime stay false.

## Safety boundary
- Licence route: NONE. Test only.
- No frozen paths, no voice edit, no deploy edit, no retention duration.

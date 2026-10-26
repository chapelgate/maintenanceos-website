# mos-1025-contractor-portal-off: contractor portal stays default-off

## Goal
Lock ENABLE_CONTRACTOR_PORTAL to default false. Portal routes return 503 when unset or not exactly true, readiness reports contractor_portal_disabled, and contractor_portal_links returns no URLs.

## Acceptance
- `tests/test_contractor_portal_off.py::test_contractor_portal_defaults_off` passes.
- `tests/test_contractor_portal_off.py::test_contractor_portal_routes_fail_closed` passes.
- `tests/test_contractor_portal_off.py::test_contractor_portal_links_empty_when_off` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

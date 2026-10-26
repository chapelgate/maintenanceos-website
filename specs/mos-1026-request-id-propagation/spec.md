# mos-1026-request-id-propagation: end-to-end request_id correlation

## Goal
Propagate the HTTP `request_id` from `HttpSecurityBoundary` through audit JSON detail and operational logging via a contextvar, closing the INCIDENT_OBSERVABILITY_MATRIX correlation GAP.

## Acceptance
- `tests/test_request_id_propagation.py::test_context_round_trip` passes.
- `tests/test_request_id_propagation.py::test_audit_merges_request_id_into_json_detail` passes.
- `tests/test_request_id_propagation.py::test_operational_event_injects_request_id` passes.
- `tests/test_request_id_propagation.py::test_ingress_sets_and_clears_context` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

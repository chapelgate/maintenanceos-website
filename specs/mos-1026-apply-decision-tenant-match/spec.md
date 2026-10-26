# mos-1026-apply-decision-tenant-match: apply refuses cross-tenant lifecycle decisions

## Goal
`_apply_decision` refuses any non-retain decision whose `decision.client_id` does not equal the sweep `client_id` before claim_action or mutation. Injected cross-tenant decisions cannot erase another tenant's records.

## Acceptance
- `tests/test_apply_decision_tenant_match.py::test_apply_checks_decision_client_id` passes.
- `tests/test_apply_decision_tenant_match.py::test_apply_rejects_cross_tenant_decision` passes.
- `tests/test_apply_decision_tenant_match.py::test_apply_retains_without_tenant_check` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

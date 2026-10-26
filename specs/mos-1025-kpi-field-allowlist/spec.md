# mos-1025-kpi-field-allowlist: reporting KPI keys stay allowlisted

## Goal
Lock `reporting.portfolio_kpis` and `reporting.operational_metrics` to explicit field allowlists that exclude contact, credential, and resident-identifying keys.

## Acceptance
- `tests/test_kpi_field_allowlist.py::test_portfolio_kpi_fields_are_exact_allowlist` passes.
- `tests/test_kpi_field_allowlist.py::test_operational_metrics_fields_are_exact_allowlist` passes.
- `tests/test_kpi_field_allowlist.py::test_portfolio_kpis_returns_only_allowlisted_keys` passes.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit.

# mos-1025-export-field-allowlist: tenant CSV export field allowlist

## Goal
Lock `export_csv.export_work_orders` to an explicit field allowlist that excludes contact, credential, and free-text access/emergency note fields. Export remains tenant-scoped by positive integer `client_id`.

## Acceptance
- `tests/test_export_field_allowlist.py::test_export_fields_are_exact_allowlist` passes.
- `tests/test_export_field_allowlist.py::test_export_rejects_non_positive_client_id` passes.
- `tests/test_export_field_allowlist.py::test_export_writes_only_allowlisted_headers` passes.
- No phone, email, password, token, or access/emergency note columns are exported.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit, no live personal data.

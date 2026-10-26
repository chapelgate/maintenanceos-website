# mos-1026-hold-scope-allowlist: lifecycle holds stay on tenant/record/subject/data_class

## Goal
create_hold only accepts scopes in VALID_HOLD_SCOPES={tenant,record,subject,data_class}. Unknown scopes fail closed before write.

## Acceptance
- `tests/test_hold_scope_allowlist.py::test_valid_hold_scopes_known_set` passes.
- `tests/test_hold_scope_allowlist.py::test_create_hold_writes_allowed_scope` passes.
- `tests/test_hold_scope_allowlist.py::test_create_hold_rejects_unknown_scope` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

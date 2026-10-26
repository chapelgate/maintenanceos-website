# mos-07-log-client-id: Integer tenant id on the redacted operational log

## Goal
Allow an integer `client_id` on the redacted operational log and drop every other `client_id` value.

## Acceptance
- `client_id` is a safe event field only when the value is an `int` and not a `bool`.
- Strings, and any non-integer, are omitted.
- Existing redaction of sensitive values inside allowed fields still runs.
- `tests/test_operational_logging.py::test_client_id_integer_is_emitted` passes.
- `tests/test_operational_logging.py::test_client_id_string_is_dropped` passes.
- `tests/test_operational_logging.py::test_redact_scrubs_sensitive_values_inside_allowed_fields` passes.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice modules, no schema change.

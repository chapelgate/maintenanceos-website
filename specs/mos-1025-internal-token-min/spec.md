# mos-1025-internal-token-min: internal API token stays at least 32 characters

## Goal
Treat INTERNAL_API_TOKEN as configured only after strip, at length 32 or more, and only when it is not a known placeholder. The API and the readiness flag use the same helper. The token value is never logged.

## Acceptance
- `tests/test_internal_token_min.py::test_internal_token_rejects_short_blank_and_placeholder` passes.
- `tests/test_internal_token_min.py::test_internal_token_accepts_32_after_strip` passes.
- `tests/test_internal_token_min.py::test_internal_token_minimum_is_32` passes.

## Safety boundary
- Licence route: NONE.
- No identity provider, no live tenant, no voice or deploy edits. Runtime commercial flags stay false.

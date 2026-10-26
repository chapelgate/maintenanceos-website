# mos-1025-http-error-sanitize: HTTPException details scrub secrets

## Goal
Sanitize string `HTTPException.detail` values before they reach clients so emails, E.164 phones, bearer tokens, OpenAI-style keys, and Twilio-like provider IDs cannot leak through `str(exc)` error paths.

## Acceptance
- `tests/test_http_error_sanitize.py::test_sanitize_http_detail_redacts_secrets` passes.
- `tests/test_http_error_sanitize.py::test_http_exception_handler_returns_redacted_detail` passes.
- `tests/test_http_error_sanitize.py::test_sanitize_leaves_non_string_detail` passes.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit.

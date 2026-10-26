# mos-1025-public-path-rate-lock: public HTTP path set and rate defaults stay locked

## Goal
Lock `ingress_security.PUBLIC_HTTP_PATHS` to the explicit contractor/messaging/voice public set and lock the default public HTTP rate at 120 requests per minute with a 429 and Retry-After: 60 response when exceeded. Edge limits still apply in production; this is the local bound only.

## Acceptance
- `tests/test_public_path_rate_lock.py::test_public_http_paths_are_exact` passes.
- `tests/test_public_path_rate_lock.py::test_default_public_http_rate_is_120` passes.
- `tests/test_public_path_rate_lock.py::test_public_path_returns_429_with_retry_after` passes.

## Safety boundary
- Licence route: NONE.
- No frozen voice/deploy edits. Rate behaviour on existing public paths only.

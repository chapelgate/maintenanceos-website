# mos-1025-security-headers-lock: HTTP security headers stay locked

## Goal
Lock `ingress_security.SECURITY_HEADERS` to an explicit set including nosniff, DENY frame, no-referrer, no-store, permissions-policy (camera/microphone/geolocation off), and cross-origin-opener-policy same-origin. Every HTTP response from `HttpSecurityBoundary` carries these values.

## Acceptance
- `tests/test_security_headers_lock.py::test_security_headers_tuple_is_exact` passes.
- `tests/test_security_headers_lock.py::test_health_response_carries_locked_headers` passes.
- `tests/test_security_headers_lock.py::test_security_headers_forbid_permissive_frame_or_referrer` passes.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit.

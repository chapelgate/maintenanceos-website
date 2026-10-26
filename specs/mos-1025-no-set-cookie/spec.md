# mos-1025-no-set-cookie: HTTP boundary strips Set-Cookie

## Goal
HttpSecurityBoundary strips Set-Cookie from responses. Product source stays cookieless (no set_cookie). /health responses do not include Set-Cookie.

## Acceptance
- `tests/test_no_set_cookie.py::test_boundary_blocks_set_cookie_header` passes.
- `tests/test_no_set_cookie.py::test_health_response_has_no_set_cookie` passes.
- `tests/test_no_set_cookie.py::test_product_source_has_no_set_cookie` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live IdP. commercial_release_ready stays false.

# mos-1025-public-https-origin-lock: PUBLIC_BASE_URL stays a bare HTTPS origin

## Goal
Lock `public_https_origin_ready` so PUBLIC_BASE_URL is https, has a real non-loopback host, and rejects userinfo, query, fragment, and non-root paths. Placeholder hosts stay false.

## Acceptance
- `tests/test_public_https_origin_lock.py::test_public_https_origin_accepts_bare_https` passes.
- `tests/test_public_https_origin_lock.py::test_public_https_origin_rejects_userinfo_query_fragment_path` passes.
- `tests/test_public_https_origin_lock.py::test_public_https_origin_rejects_loopback_and_placeholder` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live IdP edits. commercial_release_ready stays false.

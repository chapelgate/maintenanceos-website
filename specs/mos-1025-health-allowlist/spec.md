# mos-1025-health-allowlist: /health response stays on an allowlist

## Goal
Lock `GET /health` so its top-level keys and `call_capacity` keys stay on an explicit allowlist, and no secret-like key name can appear anywhere in the JSON body.

## Acceptance
- `tests/test_health_allowlist.py::test_health_top_level_and_capacity_keys_are_allowlisted` passes.
- `tests/test_health_allowlist.py::test_health_body_has_no_secret_like_keys` passes.
- `tests/test_health_allowlist.py::test_health_ok_and_version_types` passes.
- No credentials, tokens, or env values are added to `/health`.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit, no `.gitleaksignore`.

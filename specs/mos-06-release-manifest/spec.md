# mos-06-release-manifest: Secret-free release manifest

## Goal
Emit one JSON manifest for a candidate SHA and the commercial release booleans, with no secret values and no voice import.

## Acceptance
- `manifest(sha: str) -> dict` returns `git_sha`, `product_profile`, `profile_ready`, `retention_policy_configured`, `data_lifecycle_runtime_ready`, `external_identity_runtime_ready`, and `social_housing_runtime_ready`.
- Booleans come from `commercial_release_controls` and `product_profile.profile_ready`; no import of `readiness`, voice, telephony, or credential helpers.
- SHA that is not exactly 40 hex characters raises `ValueError`.
- Serialisation uses stable key order and contains no environment values, tokens, phone numbers, or emails.
- Acceptance tests in `tests/test_release_manifest.py` pass.

## Safety boundary
- Licence route: NONE. New code.
- No frozen paths, no `.github/`, Docker, `.env`, deploy configs, or voice/telephony modules.
- Does not print `.env` files.

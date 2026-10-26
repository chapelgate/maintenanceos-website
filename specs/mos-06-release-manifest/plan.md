# Plan

1. Add `product_profile.py` allowlist helper when absent from the branch (same mos-01 contract; no second profile mechanism).
2. Implement `release_manifest.manifest(sha)` reading commercial booleans and profile readiness only.
3. Reject non-40-hex SHAs at the boundary.
4. Emit a stable-key dict; prove sentinel secrets never appear in `json.dumps(manifest(...))`.
5. Add acceptance tests for fail-closed gates, secret omission, bad SHA, and no voice import.

Rollback: remove `release_manifest.py`, `product_profile.py` (if added here), `tests/test_release_manifest.py`, and `specs/mos-06-release-manifest/`.

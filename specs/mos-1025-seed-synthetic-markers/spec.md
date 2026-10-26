# mos-1025-seed-synthetic-markers: lock synthetic seed markers

## Goal
Make the isolated voice/test tenant seed publish explicit constants and refuse payloads that look like live contact data (non-`.invalid` email or non-ZZ postcode).

## Acceptance
- `tests/test_seed_synthetic_markers.py` three tests pass.
- Seed strings include SYNTHETIC / example.invalid / ZZ markers.
- No frozen voice path edits beyond the existing synthetic seed helper.

## Safety boundary
- Licence route: NONE.
- Synthetic data only; no live personal data.

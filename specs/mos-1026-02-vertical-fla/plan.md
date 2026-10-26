# Plan

1. Add named acceptance tests in `tests/test_vertical_profile.py`; confirm they fail.
2. Add `vertical_profile.py` with fail-closed `get_vertical`, overlay-key warnings, and no voice-stack imports.
3. Do not re-own mos-01 title strings; only read `PRODUCT_PROFILE`.
4. Run named tests, full suite, gitleaks; open draft PR.

Rollback: remove the three new paths above.

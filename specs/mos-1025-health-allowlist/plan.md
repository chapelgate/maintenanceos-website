# Plan

1. Add `HEALTH_TOP_LEVEL_KEYS` and `HEALTH_CALL_CAPACITY_KEYS` in `api.py`.
2. Build `/health` through those allowlists.
3. Add `tests/test_health_allowlist.py` covering keys, types, and secret-like key rejection.
4. Do not change pilot status contents beyond top-level key scanning in tests.

Rollback: revert `api.py` allowlist filter and delete `tests/test_health_allowlist.py` plus `specs/mos-1025-health-allowlist/`.

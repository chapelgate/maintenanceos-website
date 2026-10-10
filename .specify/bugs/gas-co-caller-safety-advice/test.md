# Test

Verdict: VERIFIED. This covers source and regressions. Live call delivery stays UNDER TEST under V-01 until a controlled call on each provider path is evidenced.

Run on CG, Windows, Python 3.13, 10 Oct 2026:
- `tests/test_gas_co_safety_advice.py`: 19 passed.
- Targeted claims/safety suite (R-06 file set): 198 passed on `main`, 198 passed on this branch.
- Full suite, excluding the 2 concurrency files that need the Unix-only `resource` module: 507 passed and 1 failed on `main`, 526 passed and 1 failed on this branch. The failure is the same pre-existing, Windows-only POSIX permission test (`test_ush_identity_lifecycle.py::test_private_key_and_cache_permissions_are_restrictive`).
- `decision_engine.py` is unchanged. Gas and CO are still RED and latched.
- Expert review found no blockers. See the PR description.

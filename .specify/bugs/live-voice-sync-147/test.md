# Test

Verdict: VERIFIED for source and regressions. Live behaviour still needs Andy's controlled calls (see the voice test-call script).

Run on CG, Windows, Python 3.13:
- Gemini voice, latency, policy, gas/CO and new rule tests: 44 passed.
- Full suite, excluding the 2 Unix-only concurrency files: 535 passed and 1 failed. The failure is the pre-existing, Windows-only POSIX permission test, the same as on `main`.
- Linux CI runs the full suite after merge.

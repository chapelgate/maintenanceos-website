# Plan
1. Add phone_normalise.py with PHONE_MAX and bounded normalise_phone
2. Point channels.resident_by_phone at phone_normalise; short-circuit empty targets
3. Contract tests in tests/test_phone_normalise_max.py
4. Leave identity.py unchanged (free route after #337 close)

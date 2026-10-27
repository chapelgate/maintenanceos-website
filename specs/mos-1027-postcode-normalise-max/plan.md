# Plan
1. Add postcode_normalise.py with POSTCODE_MAX=20 and bounded normalise_postcode/postcode_matches
2. Update api.identity_postcode to import from postcode_normalise; max=20
3. Contract tests in tests/test_postcode_normalise_max.py
4. Leave identity.py unchanged (free route after #338 close)

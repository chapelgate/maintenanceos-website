# Plan
1. Add postcode_normalise.py with POSTCODE_MAX and bounded helpers
2. Point api.py postcode_matches import at postcode_normalise
3. Contract tests in tests/test_postcode_normalise_max.py
4. Leave identity.py and voice_bridge.py unchanged

# mos-1213-synthetic-postcode-helper
FEATURE: expose is_synthetic_test_postcode helper for ZZ test range

## What
Buyer pack and synthetic fixtures rely on ZZ* postcodes, but postcode_normalise has no shared helper to recognise that range.

## Acceptance
- is_synthetic_test_postcode returns True for ZZ* after normalisation
- Returns False for empty/overlong/non-ZZ values
- Existing postcode suites stay green

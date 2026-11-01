# mos-1215-phone-e164-helper
FEATURE: expose is_e164_phone helper on normalised phone values

## What
webhook_security has an E164 regex, but phone_normalise has no shared validity helper after normalisation.

## Acceptance
- is_e164_phone returns True only for +[1-9][0-9]{7,14}
- Empty/overlong/non-E164 return False
- Existing phone_normalise suites stay green

# mos-1258-phone-normalise-control-chars
FEATURE: reject control characters in phone_normalise.normalise_phone / is_e164_phone

## What
phone_normalise.normalise_phone strips digits but still accepts C0 control bytes in raw input.
identity.normalise_phone already fails closed on ord(ch) < 32; channels uses phone_normalise.

## Acceptance
- normalise_phone returns "" for control-char input
- is_e164_phone returns False for control-char input
- clean UK mobiles still normalise
- existing phone_normalise / mos-1215 suites stay green

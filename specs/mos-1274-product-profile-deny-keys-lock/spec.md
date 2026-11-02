# mos-1274-product-profile-deny-keys-lock
FEATURE: lock DENY_KEYS acceptance to the full frozen overlay set

## What
mos-1268 expanded DENY_KEYS to 21 frozen surfaces. Older lock tests still expected 11 keys, so suite honesty went red.

## Acceptance
- test_mos_1059 and test_mos_1061 lock sets equal product_profile.DENY_KEYS (21)
- validate_overlay still rejects every deny key
- safe branding keys still allowed

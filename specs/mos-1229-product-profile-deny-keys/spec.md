# mos-1229-product-profile-deny-keys
FEATURE: expand product_profile DENY_KEYS for deploy/secret/golden-line overlays

## What
validate_overlay blocks retention/voice/telephony/market/dispatch/credential but not deploy, nginx, golden_line, or secret overlay keys.

## Acceptance
- DENY_KEYS includes deploy, nginx, golden_line, secret, production
- validate_overlay raises on those keys
- Existing DENY_KEYS behaviour stays

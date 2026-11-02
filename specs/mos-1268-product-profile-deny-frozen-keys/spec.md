# mos-1268-product-profile-deny-frozen-keys
FEATURE: expand product_profile DENY_KEYS for frozen/PII overlay surfaces

## What
Overlay validation allowed disclosure/redaction/pii/live_customer/approved_release/ir_deadline/voice_line/production_db/nginx_config keys.

## Acceptance
- new keys present in DENY_KEYS
- validate_overlay rejects each
- safe branding still allowed
- test_mos_1229 stays green

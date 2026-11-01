# mos-1245-tenant-resident-phone-control-chars
FEATURE: reject control characters in tenant_security resident_by_phone_for_client normalised_phone

## What
resident_by_phone_for_client accepts normalised_phone without control-char validation.

## Acceptance
- resident_by_phone_for_client returns None on control chars in normalised_phone
- clean input still matches

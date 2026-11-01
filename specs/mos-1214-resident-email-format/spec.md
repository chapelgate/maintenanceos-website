# mos-1214-resident-email-format
FEATURE: strict email format + control-char reject in resident_by_email

## What
resident_by_email only enforces length; malformed emails can still hit the DB lookup.

## Acceptance
- Reject control characters, missing @, multiple @, missing domain/TLD
- Keep EMAIL_LOOKUP_MAX length reject
- Existing channel suites stay green

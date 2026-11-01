# mos-1261-export-resident-name-forbid
FEATURE: forbid resident_name in CSV export denylist

## What
reporting forbids resident_name; export_csv lagged that PII key.

## Acceptance
- resident_name in FORBIDDEN_EXPORT_FIELDS
- no allowlist overlap

# mos-1228-export-forbidden-fields
FEATURE: expand FORBIDDEN_EXPORT_FIELDS with session/csrf/cookie/bearer keys

## What
export_csv blocks phone/email/password/token/secret but not session, csrf, cookie, or bearer keys that could leak auth material if added to an allowlist later.

## Acceptance
- FORBIDDEN_EXPORT_FIELDS includes session, csrf, cookie, bearer (and common variants)
- Existing export allowlist still has no overlap
- Named acceptance test green

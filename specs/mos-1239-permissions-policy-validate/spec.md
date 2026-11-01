# mos-1239-permissions-policy-validate
FEATURE: add validate_permissions_policy helper for explicit policy string check

## What
permissions_configured() only checks ingress_security.SECURITY_HEADERS. Callers need to validate arbitrary policy strings.

## Acceptance
- validate_permissions_policy(policy: str) -> bool returns True only for policies containing required directives
- Returns False for empty/None/non-string/malformed input
- No control characters allowed
- Existing permissions_configured() still works

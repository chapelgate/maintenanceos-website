# mos-1254-deny-keys-test-lock
FEATURE: align DENY_KEYS acceptance locks with expanded frozen-surface set from mos-1229

## What
mos-1229 expanded DENY_KEYS with deploy/nginx/golden_line/secret/production. Stale mos-1059/1061 locks still require exactly six keys and fail the suite.

## Acceptance
- mos-1059 deny-keys lock expects the 11-key frozen-surface set
- mos-1061 comprehensive deny-keys lock matches the same set
- mos-1229 frozen-surface rejects still pass

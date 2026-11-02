# mos-1267-schema-call-sessions-call-sid
FEATURE: monitor call_sessions.call_sid uniqueness in schema_health

## What
CallSession has a unique index on call_sid; schema_health REQUIRED_UNIQUES omitted it, so drift would go undetected. Prior mos-1230 test asserted the wrong column set.

## Acceptance
- REQUIRED_UNIQUES includes call_sessions: {("call_sid",)}
- schema_report on Base.metadata is schema_compatible
- mos-1230 + mos-1267 tests green

# mos-1230-schema-call-sessions
FEATURE: add call_sessions event_key unique constraint check to schema_health.py

## What
schema_health.py checks unique constraints but has no entry for call_sessions(event_key), so a missing unique would go undetected.

## Acceptance
- schema_report reports missing unique for call_sessions(event_key)
- test passes on fresh DB
- Named acceptance test green

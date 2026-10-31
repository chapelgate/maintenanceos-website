# Assessment — mos-1186 tenant_health zeros

## Symptom
`GET /health` always returns zeroed `tenant_health` KPIs even when process-local work orders exist.

## Root cause
`api.health` hard-coded zeros for every `TENANT_HEALTH_KEYS` entry instead of reading the process DB.

## Class
BUG (stub metrics misrepresent process state)

## Acceptance
- `/health.tenant_health` reflects process-local WorkOrder/Approval/AuditEvent counts
- allowlist keys unchanged; `data_scope` remains `process-local`
- fail-closed to zeros if DB unavailable
- regression tests cover seeded counts + fail-closed

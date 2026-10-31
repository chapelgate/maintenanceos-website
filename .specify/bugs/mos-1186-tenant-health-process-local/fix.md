# Fix — mos-1186

1. Add `reporting.process_local_tenant_health()` computing allowlisted KPI fields from SessionLocal.
2. Wire `api.health` to call it once and project onto `TENANT_HEALTH_KEYS`.
3. Keep existing `portfolio_kpis` / `contractor_scorecard` / `operational_metrics` intact.

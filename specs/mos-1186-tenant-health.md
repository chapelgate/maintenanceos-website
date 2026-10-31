# Slice: mos-1186-tenant-health-process-local

**Purpose:** Wire real process-local tenant_health KPIs into /health endpoint instead of zero stubs.

**Base:** origin/main (430ac02a)

**Acceptance:**
- /health returns real tenant_health counts (open_jobs, closed_jobs, p1_jobs, repeat_repairs, open_sla_breaches, avg_close_hours, human_intervention_rate, unresolved_exceptions) from process-local DB
- data_scope remains "process-local"
- Existing health_allowlist tests pass
- No schema change

**Implementation notes:**
- Add `compute_tenant_health(client_id)` to reporting.py using existing SessionLocal + portfolio_kpis logic
- Health endpoint calls it for the configured internal API tenant (single-tenant process-local)
- keep data_scope = "process-local"

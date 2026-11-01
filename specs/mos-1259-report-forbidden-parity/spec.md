# mos-1259-report-forbidden-parity
FEATURE: align FORBIDDEN_REPORT_FIELDS with export auth-material denylist

## What
export_csv forbids csrf/cookies/access_token/refresh_token/emergency_notes; reporting KPI scrub list lagged.

## Acceptance
- required auth-material keys subset of FORBIDDEN_REPORT_FIELDS
- no overlap with OPERATIONAL_METRICS_FIELDS / PORTFOLIO_KPI_FIELDS
- mos-1207 suite stays green

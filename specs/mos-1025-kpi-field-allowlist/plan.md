# Plan
1. Publish PORTFOLIO_KPI_FIELDS, OPERATIONAL_METRICS_FIELDS, and FORBIDDEN_REPORT_FIELDS.
2. Filter both reporting helpers through the allowlists and refuse forbidden keys.
3. Add focused pytest coverage.
Rollback: revert reporting.py; delete tests and specs dir.

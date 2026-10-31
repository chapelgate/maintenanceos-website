# mos-1038-observability

## Goal
Add a `/metrics` endpoint (internal API only) that returns `operational_metrics(client_id)` from reporting.py as JSON. No external targets; local data only.

## Acceptance
- test_operational_metrics_returns_dict
- test_metrics_no_external_target
- test_metrics_uses_local_data_scope

## Out of scope
voice, deploy, central monitoring, external telemetry.

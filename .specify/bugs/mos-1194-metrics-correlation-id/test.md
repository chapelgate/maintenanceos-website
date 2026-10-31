# Test — mos-1194

## Commands
```
python -m pytest tests/test_mos_1194_metrics_correlation_id.py tests/test_mos_1038_observability.py tests/test_kpi_field_allowlist.py -q
```

## Verdict
verified when /metrics exposes correlation_id matching request context and allowlist/observability suites stay green.

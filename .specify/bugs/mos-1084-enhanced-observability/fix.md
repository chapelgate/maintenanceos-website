# Fix — mos-1084

1. Add correlation_id to HEALTH_TOP_LEVEL_KEYS.
2. In api.health, read request_context.request_id(), set body.correlation_id and x-correlation-id; keep issue_health_csrf() / x-csrf-token.
3. Allow correlation_id in SAFE_EVENT_FIELDS; inject it beside request_id in operational_event when a request id is present.
4. Lock with test_health_correlation_id_present, test_health_correlation_id_propagated, test_health_structured_json_output.

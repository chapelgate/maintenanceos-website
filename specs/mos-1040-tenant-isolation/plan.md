# Plan
1. Lock VOICE_TENANT_MODE fail-closed defaults and isolated_test gating
2. Lock operational_logging SAFE_EVENT_FIELDS / client_id integer-only / secret key drop
3. Lock tenant-scoped operational_event payloads never emit raw secrets

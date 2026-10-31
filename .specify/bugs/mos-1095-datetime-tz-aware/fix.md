# Fix — mos-1095

Replace `datetime.utcnow()` with `datetime.now(timezone.utc)` and import `timezone` in:
- tests/test_acceptance_local.py
- tests/test_contractor_operations.py
- tests/test_lifecycle_integrity.py
- tests/test_tenant_isolation_extended.py
- tests/test_voice_action_claims.py
- tests/test_worker_recovery.py

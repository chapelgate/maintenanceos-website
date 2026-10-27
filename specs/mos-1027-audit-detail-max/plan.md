# Plan
1. Add AUDIT_DETAIL_MAX = 8000 in operations.py
2. Reject overlong redacted detail in audit() before session.add
3. Contract tests in tests/test_audit_detail_max.py

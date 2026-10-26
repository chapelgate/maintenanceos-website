# Plan

1. Keep `audit_text.redact_detail` for bearer tokens, `sk-` keys, emails, E.164 phones, and provider ids.
2. Keep `operations.audit` storing the redacted detail only.
3. Keep the three acceptance tests, including the in-memory SQLite check.
4. Add this Spec Kit artifact so Estate Gate can see the FEATURE route is converged.

Rollback: delete `audit_text.py`, `tests/test_audit_text.py`, and `specs/mos-04-audit-detail/`, and restore `operations.audit` to store `detail` unchanged.

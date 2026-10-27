# Build readiness
- Class: FEATURE
- Route: Spec Kit SDD (fail-closed input hardening)
- Frozen paths: none
- Rollback: revert PR
Acceptance: pytest tests/test_invoice_number_control.py tests/test_invoice_number_len.py

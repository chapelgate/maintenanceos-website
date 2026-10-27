# mos-1028-ops-log-pem-redact

## Goal
Redact PEM private key blocks in operational_logging._redact.

## Acceptance
- BEGIN/END PRIVATE KEY blocks become [REDACTED]
- tests/test_ops_log_pem_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

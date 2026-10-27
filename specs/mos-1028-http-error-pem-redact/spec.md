# mos-1028-http-error-pem-redact

## Goal
Redact PEM private key blocks in HTTP error details.

## Acceptance
- BEGIN/END PRIVATE KEY blocks become [REDACTED]
- tests/test_http_error_pem_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

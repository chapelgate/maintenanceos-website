# mos-1028-ops-log-aws-jwt-redact

## Goal
Redact AWS access keys and JWTs in operational_logging._redact, matching http_error_text.

## Acceptance
- AWS AKIA/ASIA keys and JWT-shaped tokens become [REDACTED] in allowed string fields
- tests/test_ops_log_aws_jwt_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

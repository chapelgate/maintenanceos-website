# mos-1028-audit-aws-jwt-redact

## Goal
Redact AWS access keys and JWTs in audit_text.redact_detail.

## Acceptance
- AKIA/ASIA keys and JWT triples become [REDACTED]
- tests/test_audit_aws_jwt_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

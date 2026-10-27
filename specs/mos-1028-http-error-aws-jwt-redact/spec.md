# mos-1028-http-error-aws-jwt-redact

## Goal
Redact AWS access key IDs and JWT bearer-shaped tokens from HTTPException detail text.

## Acceptance
- sanitize_http_detail redacts AKIA/ASIA keys and eyJ... JWTs
- existing Bearer/OpenAI/email/phone/provider redactions still pass
- tests/test_http_error_aws_jwt_redact.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

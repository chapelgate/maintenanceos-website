# mos-1028-aws-secret-key-redact

## Goal
Redact AWS secret access keys (40-char base64) across HTTP errors, audit detail, and operational logs.

## Acceptance
- 40-char AWS secret keys become [REDACTED] in all three redactors
- AWS access key IDs (AKIA/ASIA) remain redacted via AWS_ACCESS_KEY
- dedicated pytest module passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

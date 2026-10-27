# mos-1028-ops-log-stripe-key-redact

## Goal
Redact Stripe secret/restricted keys in operational_logging._redact.

## Acceptance
- sk_/rk_ live/test keys become [REDACTED]
- tests/test_ops_log_stripe_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags. Publishable pk_ keys unchanged.

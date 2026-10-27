# mos-1028-audit-stripe-key-redact

## Goal
Redact Stripe secret/restricted keys in audit_text.redact_detail.

## Acceptance
- sk_/rk_ live/test keys become [REDACTED]
- tests/test_audit_stripe_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags. Publishable pk_ keys unchanged.

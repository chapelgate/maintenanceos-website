# mos-1028-http-error-stripe-key-redact

## Goal
Redact Stripe secret/restricted keys (sk_live/sk_test/rk_live/rk_test) in sanitize_http_detail.

## Acceptance
- those keys become [REDACTED]
- tests/test_http_error_stripe_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags. Publishable pk_ keys unchanged.

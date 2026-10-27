# mos-1028-shopify-token-redact

## Goal
Redact Shopify Admin/Storefront/Custom/Private app tokens (shpat_/shpss_/shpca_/shppa_) in HTTP errors, audit text, and operational logs.

## Acceptance
- All three redactors remove Shopify tokens
- tests/test_shopify_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets storage, frozen paths, commercial runtime flags.

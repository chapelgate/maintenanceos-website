# mos-1028-pypi-token-redact

## Goal
Redact PyPI API tokens (pypi-...) in HTTP errors, audit text, and operational logs.

## Acceptance
- All three redactors remove PyPI tokens
- tests/test_pypi_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets storage, frozen paths, commercial runtime flags.

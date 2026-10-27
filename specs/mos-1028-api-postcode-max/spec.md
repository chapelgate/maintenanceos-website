# mos-1028-api-postcode-max

## Goal
Identity postcode endpoint fail-closes using the shared POSTCODE_MAX constant instead of a hardcoded 20.

## Acceptance
- api.identity_postcode uses POSTCODE_MAX from postcode_normalise
- POSTCODE_MAX == 20
- overlong postcode rejected by _bounded_text
- tests/test_api_postcode_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

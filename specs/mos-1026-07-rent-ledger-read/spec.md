# mos-1026-07-rent-ledger-read

## Goal
Flagged read-only rent/arrears evaluation via landlordos.rent_ledger. Default off. No payments, bank writes, or gateways.

## Acceptance
- tests/test_landlord_rent_bridge.py::test_flag_default_off
- tests/test_landlord_rent_bridge.py::test_synthetic_ledger_eval
- tests/test_landlord_rent_bridge.py::test_no_payment_gateway_or_bank_write
- Missing landlordos fails closed for library-shaped records

## Out of scope
voice, deploy, payment providers, live PII, commercial runtime flags.

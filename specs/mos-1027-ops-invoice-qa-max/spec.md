# mos-1027-ops-invoice-qa-max

## Goal
Fail closed when invoice_qa receives an overlong invoice_number, overlong description, or overlarge amount, returning None before opening a session.

## Acceptance
tests/test_ops_invoice_qa_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

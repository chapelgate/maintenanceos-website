# mos-1028-invoice-number-control

## Goal
Invoice number descriptions reject control characters via _reject_control_chars.

## Acceptance
- /invoices descriptions run through _reject_control_chars
- control characters raise HTTP 400
- tests/test_invoice_number_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

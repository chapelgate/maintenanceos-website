# mos-1028-quote-desc-control

## Goal
Quote and invoice description fields reject control characters via _reject_control_chars, matching work-order description handling.

## Acceptance
- /quotes and /invoices descriptions run through _reject_control_chars
- control characters raise HTTP 400
- tests/test_quote_desc_control.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

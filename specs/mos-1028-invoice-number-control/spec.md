# mos-1028-invoice-number-control

## Goal
Invoice numbers reject control characters via _reject_control_chars.

## Acceptance
- /invoices invoice_number runs through _reject_control_chars
- control characters raise HTTP 400
- focused tests pass

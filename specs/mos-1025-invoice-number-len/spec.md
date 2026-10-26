# mos-1025-invoice-number-len: invoice number stays bounded

## Goal
Invoice numbers are required, stripped, and at most 100 characters. Empty, non-text, and overlong invoice numbers fail closed with HTTP 400 before quote/invoice storage.

## Acceptance
- `tests/test_invoice_number_len.py::test_invoice_number_max_is_100` passes.
- `tests/test_invoice_number_len.py::test_invoice_number_accepts_bounded_text` passes.
- `tests/test_invoice_number_len.py::test_invoice_number_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

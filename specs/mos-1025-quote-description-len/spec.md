# mos-1025-quote-description-len: quote and invoice descriptions stay bounded

## Goal
Quote and invoice descriptions are stripped and at most 4000 characters. Non-text and overlong descriptions fail closed with HTTP 400 before storage.

## Acceptance
- `tests/test_quote_description_len.py::test_quote_description_max_is_4000` passes.
- `tests/test_quote_description_len.py::test_quote_description_accepts_bounded_text` passes.
- `tests/test_quote_description_len.py::test_quote_description_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

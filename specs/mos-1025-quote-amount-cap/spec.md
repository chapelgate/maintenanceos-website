# mos-1025-quote-amount-cap: quote and invoice amounts stay at most 1_000_000

## Goal
_positive_amount accepts only finite amounts greater than 0 and at most 1_000_000. Overlarge amounts fail closed with HTTP 400 before quote or invoice storage.

## Acceptance
- `tests/test_quote_amount_cap.py::test_amount_max_is_one_million` passes.
- `tests/test_quote_amount_cap.py::test_positive_amount_accepts_bounded_values` passes.
- `tests/test_quote_amount_cap.py::test_positive_amount_rejects_overlarge` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

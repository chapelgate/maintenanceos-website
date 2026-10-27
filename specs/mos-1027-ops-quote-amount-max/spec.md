# mos-1027-ops-quote-amount-max

## Goal
Fail closed when submit_quote receives amount above AMOUNT_MAX (1_000_000) or description longer than QUOTE_DESCRIPTION_MAX (4000), returning None before opening a session.

## Acceptance
tests/test_ops_quote_amount_max.py passes.

## Safety
Licence route: NONE. No voice/deploy/secrets.

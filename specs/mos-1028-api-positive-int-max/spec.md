# mos-1028-api-positive-int-max

## Goal
Fail closed when API positive integers exceed POSITIVE_INT_MAX (signed 32-bit), including contractor portal form ids.

## Acceptance
- POSITIVE_INT_MAX == 2147483647
- _positive_int rejects 0, negatives, and values above POSITIVE_INT_MAX
- contractor decision/availability/complete submit revalidate ids via _positive_int
- tests/test_api_positive_int_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

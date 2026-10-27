# mos-1028-triage-category-max

## Goal
Fail closed when resolve_triage receives a category longer than TRIAGE_CATEGORY_MAX before allowlist membership is considered.

## Acceptance
- TRIAGE_CATEGORY_MAX == 64 and covers all TRIAGE_CATEGORIES
- overlong category returns False before SessionLocal
- allowlisted categories still proceed past the length gate
- tests/test_triage_category_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags, trade length (separate slice).

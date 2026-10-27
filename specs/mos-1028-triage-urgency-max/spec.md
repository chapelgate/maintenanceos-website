# mos-1028-triage-urgency-max

## Goal
Fail closed when resolve_triage receives an urgency longer than TRIAGE_URGENCY_MAX before TRIAGE_URGENCIES membership is considered.

## Acceptance
- TRIAGE_URGENCY_MAX == 2 and covers all TRIAGE_URGENCIES
- overlong urgency returns False before SessionLocal
- tests/test_triage_urgency_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

# mos-1028-contractor-decision-max

## Goal
Fail closed when contractor portal decision query/form text exceeds CONTRACTOR_DECISION_MAX before allowlist membership is considered.

## Acceptance
- CONTRACTOR_DECISION_MAX == 16
- GET/POST /contractor/decision reject overlong decision with HTTP 400
- allowlisted accept/decline still accepted
- tests/test_contractor_decision_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

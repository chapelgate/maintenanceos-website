# mos-1028-triage-trade-max

## Goal
Fail closed when resolve_triage receives a trade longer than TRIAGE_TRADE_MAX before allowlist membership is considered.

## Acceptance
- TRIAGE_TRADE_MAX == 64 and covers all TRADE values
- overlong trade returns False before SessionLocal
- allowlisted trades still proceed past the length gate
- tests/test_triage_trade_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

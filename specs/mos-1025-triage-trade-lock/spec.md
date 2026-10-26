# mos-1025-triage-trade-lock: triage trade must match TRADE[category]

## Goal
Triage resolution accepts only the deterministic trade for the chosen category from decision_engine.TRADE. Mismatched, empty, and free-text trades fail closed before SessionLocal.

## Acceptance
- `tests/test_triage_trade_lock.py::test_triage_trade_uses_decision_engine_trade` passes.
- `tests/test_triage_trade_lock.py::test_triage_accepts_matching_trade` passes.
- `tests/test_triage_trade_lock.py::test_triage_rejects_mismatched_trade` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

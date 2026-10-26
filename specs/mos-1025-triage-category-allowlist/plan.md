# Plan
1. Add TRIAGE_CATEGORIES frozenset matching decision_engine.CATEGORIES keys (excluding Unknown).
2. Reject categories outside that set in resolve_triage before SessionLocal.
3. Run the three named tests.

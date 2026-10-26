# mos-1025-triage-urgency-frozenset: triage urgency stays on P2/P3

## Goal
Triage resolution accepts only urgency values in TRIAGE_URGENCIES={P2,P3}. Values outside that set fail closed before SessionLocal.

## Acceptance
- `tests/test_triage_urgency_frozenset.py::test_triage_urgencies_known_set` passes.
- `tests/test_triage_urgency_frozenset.py::test_triage_accepts_allowed_urgency` passes.
- `tests/test_triage_urgency_frozenset.py::test_triage_rejects_unknown_urgency` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

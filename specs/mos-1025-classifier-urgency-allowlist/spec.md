# mos-1025-classifier-urgency-allowlist: classifier urgency stays on P1/P2/P3

## Goal
decision_engine.classify returns only urgency values in URGENCIES={P1,P2,P3}. Values outside that set fail closed with ValueError before the classify result is returned.

## Acceptance
- `tests/test_classifier_urgency_allowlist.py::test_urgencies_known_set` passes.
- `tests/test_classifier_urgency_allowlist.py::test_classify_returns_allowed_urgency` passes.
- `tests/test_classifier_urgency_allowlist.py::test_classify_rejects_unknown_urgency` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

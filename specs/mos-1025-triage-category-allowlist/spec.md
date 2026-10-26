# mos-1025-triage-category-allowlist: triage categories stay on the known set

## Goal
Triage resolution accepts only the existing decision_engine category names. Unknown, empty, and free-text categories fail closed before SessionLocal.

## Acceptance
- `tests/test_triage_category_allowlist.py::test_triage_categories_match_decision_engine` passes.
- `tests/test_triage_category_allowlist.py::test_triage_accepts_known_category` passes.
- `tests/test_triage_category_allowlist.py::test_triage_rejects_unknown_category` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.

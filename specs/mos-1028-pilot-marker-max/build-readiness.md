# Build readiness
- Class: FEATURE
- Route: Spec Kit SDD (fail-closed boundary)
- Frozen paths: none (pilot proof endpoint only; not golden line)
- Rollback: revert PR
- Acceptance: pytest tests/test_pilot_marker_max.py

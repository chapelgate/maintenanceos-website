# lo-ws-08-pilot-synthetic: Synthetic pilot scorecard, rollback, and runbook

## Goal
Run a synthetic England landlord vertical end to end, roll the vertical flag back off, and record the pilot runbook. No live personal data.

## Acceptance
- `tests/test_landlord_vertical_e2e.py` passes, including the synthetic England path and the live-email rejection.
- `tests/test_landlord_vertical_rollback.py::test_vertical_off_restores_baseline` passes.
- `docs/commercial_release/LANDLORD_VERTICAL_PILOT.md` is present.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no production database, no golden phone line.

# mos-1025-obs-local-only: operational logging stays process-local

## Goal
Lock the honesty claim that structured operational logging is process-local and opt-in, and that readiness does not claim central monitoring.

## Acceptance
- Three tests in tests/test_obs_local_only.py pass.
- No new monitoring service is added.

## Safety boundary
Licence route: NONE. No deploy or frozen path edits.

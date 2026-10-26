# mos-1025-synthetic-onboard: synthetic buyer onboarding kit

## Goal
Add a synthetic-only buyer/onboarding kit that documents a local demo path and locks the claim that the kit does not open commercial release or use live personal data.

## Acceptance
- `docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md` exists and states synthetic-only, no live PII, commercial_release_ready stays false.
- `tests/test_synthetic_buyer_onboarding_kit.py` three tests pass.
- No frozen path edits.

## Safety boundary
- Licence route: NONE.
- No deploy, voice, nginx, production DB, or live customer records.

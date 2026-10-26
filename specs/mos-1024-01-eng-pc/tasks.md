# Tasks

- [x] Delete full-postcode mixed-border allowlist; use district sets for CH/SY.
- [x] Add `AL` to `_ENGLAND_AREAS`; keep TD fail-closed.
- [x] Acceptance: `test_builds_context_from_synthetic_rows`.
- [x] Acceptance: `test_rejects_non_england_postcode_for_pilot`.
- [x] Acceptance: `test_no_schema_migration_required`.
- [x] Acceptance: `test_wallasey_ch45_accepted` (CH45 2AB / Wallasey ORM row).
- [x] Acceptance: `test_welsh_ch4_rejected`.
- [x] Prove accept CH45/CH1/CH64/SY8/SY14/AL/SW; reject CH4/CH5/SY15/BT/ZZ/TD/malformed.
- [x] Full suite + gitleaks; draft PR on `readiness/mos-1024-01-eng-pc`.

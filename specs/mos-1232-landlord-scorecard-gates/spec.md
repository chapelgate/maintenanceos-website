# mos-1232-landlord-scorecard-gates
FEATURE: e2e_scorecard reports market_scope_ok and synthetic_data_ok fail-closed flags

## What
e2e_scorecard only reports vertical/synthetic/no_live_pii; callers cannot see whether landlord market scope and synthetic data mode are satisfied.

## Acceptance
- e2e_scorecard includes market_scope_ok and synthetic_data_ok booleans
- market_scope_ok True only for uk-non-social-housing
- synthetic_data_ok True only for LANDLORD_PILOT_DATA_MODE=synthetic
- landlord_guard_active True only when vertical=landlord and both ok flags True

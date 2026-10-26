# mos-1026-03-pilot-guards

## Goal
When WORKSMART_VERTICAL=landlord (with PRODUCT_PROFILE=worksmartos), enforce England private pilot caps: ≤10 properties per client, COMMERCIAL_MARKET_SCOPE=uk-non-social-housing, readiness false unless LANDLORD_PILOT_DATA_MODE=synthetic.

## Acceptance
- tests/test_landlord_pilot_guards.py::test_eleventh_property_fails_closed
- tests/test_landlord_pilot_guards.py::test_landlord_vertical_requires_non_social_scope
- tests/test_landlord_pilot_guards.py::test_live_pii_mode_keeps_readiness_false
- tests/test_landlord_pilot_guards.py::test_vertical_off_leaves_limits_unchanged

## Out of scope
awaab_*, ush_*, migrate_schema, seed modules, EW housing packs, voice/telephony, deploy/**, IR deadlines, production DBs.

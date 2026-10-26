# Plan

1. Add `vertical_profile.py` with `get_vertical()`, `is_landlord()`, and `is_worksmartos()`.
2. Read `WORKSMART_VERTICAL` and `PRODUCT_PROFILE` at the boundary. Strip both. Lower only the vertical.
3. Return `none` unless the vertical is `landlord` and the profile is exactly `worksmartos`.
4. Warn and ignore non-blank overlay keys. Do not read them into the result.
5. Cover the five named acceptance tests. Do not wire api, dashboard, or readiness until a later slice calls the selector.

Rollback: delete the new module, its test, and this spec folder.

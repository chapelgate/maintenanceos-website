# mos-1024-01-eng-pc: England pilot postcodes by CH/SY district

## Goal
England private-pilot postcode check uses CH/SY outward districts (not an
eight-string full-postcode allowlist) so Wallasey `CH45 2AB` can build landlord
context. Add `AL` to England areas. Leave TD fail-closed. No schema change.
No seed edit.

## Acceptance
- `landlord_context_adapter.py` parses outward district (area letters + district
  digits) for CH/SY and accepts only listed England districts.
- `AL` is in `_ENGLAND_AREAS`; TD remains rejected.
- Cap keys on `WORKSMART_VERTICAL=landlord` only.
- Null-id isolation and ≤10 cap behaviour preserved.
- Named tests pass:
  - `test_builds_context_from_synthetic_rows`
  - `test_rejects_non_england_postcode_for_pilot`
  - `test_no_schema_migration_required`
  - `test_wallasey_ch45_accepted`
  - `test_welsh_ch4_rejected`

## Safety boundary
- Licence route: NONE. Original district sets only. Do not paste Royal Mail PAF,
  ONS, Wikipedia, or MicroRealEstate strings.
- Do not touch `seed.py`, `models.py`, `migrate_schema.py`, voice, deploy, EW.
- Synthetic fixtures only.

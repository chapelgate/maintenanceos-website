# lo-ws-02-vertical-flag: WorkSmartOS landlord vertical selector

## Goal

Fail-closed selector for `WORKSMART_VERTICAL`. Presentation titles stay owned by mos-01 `PRODUCT_PROFILE`. This module only reads that variable.

## Acceptance

- `WORKSMART_VERTICAL` is `none` or `landlord`. Default is `none`.
- `landlord` is returned only when stripped `PRODUCT_PROFILE` is exactly `worksmartos`. Any other profile returns `none`.
- Blank, whitespace, `none`, `NONE`, and unknown values return `none`.
- Non-blank overlay keys `WORKSMART_RETENTION`, `WORKSMART_VOICE`, `WORKSMART_TELEPHONY`, `WORKSMART_MARKET`, `WORKSMART_DISPATCH`, and `WORKSMART_CREDENTIALS` emit one `RuntimeWarning` each and do not change the vertical. Warnings do not include the key value.
- `vertical_profile.py` imports only `os` and `warnings`.
- Named tests in `tests/test_vertical_profile.py` pass.

## Safety boundary

- Licence route: NONE. Clean-room. No copied third-party code.
- No voice, telephony, genai, or apscheduler import.
- No frozen path edits. No NVIDIA runtime call.
- Rollback: delete `vertical_profile.py`, `tests/test_vertical_profile.py`, and `specs/lo-ws-02-vertical-flag/`.

# mos-1240-vertical-overlay-control-chars
FEATURE: reject control characters in vertical_profile overlay key values; deny frozen-surface overlay keys

## What
vertical_profile._get_env returns raw env values without control-char validation; OVERLAY_KEYS lacks deploy/nginx/golden_line/secret keys.

## Acceptance
- _get_env returns "" for control-char values
- OVERLAY_KEYS includes deploy/nginx/golden_line/secret/production overlay keys
- get_vertical/is_landlord/is_worksmartos still behave

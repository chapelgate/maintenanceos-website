# mos-1027-product-profile-ready

## Goal
Wire product_profile_ready into readiness CHECKS and local/public profile gates; surface a bad profile on the release banner.

## Acceptance
tests/test_product_profile_ready.py passes; product_profile_ready present in report; invalid PRODUCT_PROFILE fails closed.

## Safety
Licence route: NONE. No voice/deploy/secrets.

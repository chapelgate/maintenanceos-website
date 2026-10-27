# mos-1027-contractor-token-max

## Goal
Fail-closed bound on contractor portal signed-link tokens before HMAC verify, so overlong tokens cannot force signature work.

## Acceptance
- CONTRACTOR_LINK_TOKEN_MAX = 200 in security.py
- verify_link returns False for None/non-str/overlong tokens without calling sign_link
- contractor portal GET/POST endpoints raise HTTP 400 "token is too long" when over the max
- tests/test_contractor_token_max.py passes
- valid signed tokens (~54 chars) still verify

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.

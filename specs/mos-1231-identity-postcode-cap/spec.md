# mos-1231-identity-postcode-cap
FEATURE: bound identity.normalise_postcode / normalise_phone with max length and control-char reject

## What
identity helpers still accept unbounded/control-char inputs; postcode_normalise already caps at 20.

## Acceptance
- normalise_postcode returns "" for overlong or control-char input
- normalise_phone returns "" for overlong (>50) or control-char input
- Existing identity suite stays green

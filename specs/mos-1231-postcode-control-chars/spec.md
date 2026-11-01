# mos-1231-postcode-control-chars
FEATURE: reject control characters in postcode_matches / normalise postcodes

## What
postcode_matches and normalise_postcode accept raw strings with control characters.

## Acceptance
- postcode_matches returns False on control chars in either arg
- normalise_postcode strips control chars (returns empty string on all-control)
- postcode_matches with clean input stays green
- Named acceptance test green

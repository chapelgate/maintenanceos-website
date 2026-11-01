# mos-1223-result-ref-control-chars
FEATURE: reject control characters in set_result_ref

## What
set_result_ref validates length but allows control characters in the result reference.

## Acceptance
- Raise ValueError on control chars (except tab/newline/cr)
- Existing length reject stays
- Named acceptance test green

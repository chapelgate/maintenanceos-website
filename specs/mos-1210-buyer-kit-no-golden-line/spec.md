# mos-1210-buyer-kit-no-golden-line
FEATURE: require no_golden_line step field in synthetic buyer onboarding kit

## What
Kit honesty locks forbid golden-line calls, but REQUIRED_STEP_FIELDS only lists no_pstn_call.

## Acceptance
- REQUIRED_STEP_FIELDS includes no_golden_line
- Kit markdown documents the field
- Existing buyer kit suites stay green

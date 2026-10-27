# mw-137-llms-release-align

## Goal
Align llms.txt / llms-full.txt machine-readable honesty markers with release.json and status.json denials.

## Acceptance
- Both llms files list public_launch/commercial_ga/live_phone/sla_claim false.
- node --test scripts/llms-honesty.test.mjs passes.

# mw-134-status-release-align

## Goal
Align status.json honesty fields with the release marker by denying commercial_ga and live_phone alongside existing live/SLA denials.

## Acceptance
- public/status.json sets commercial_ga and live_phone false.
- node --test scripts/status-json-honesty.test.mjs passes.
- Status page copy mentions the aligned denials.

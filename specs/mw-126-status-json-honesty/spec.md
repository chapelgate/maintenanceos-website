# mw-126-status-json-honesty

## Goal
Publish a machine-readable status.json that denies live status, uptime figures, and SLA claims for the pre-launch synthetic demo.

## Acceptance
- public/status.json exists with live false, sla_claim false, uptime_percent null.
- /status/ page links to /status.json and keeps noindex + no fake uptime.
- node --test scripts/status-json-honesty.test.mjs passes.

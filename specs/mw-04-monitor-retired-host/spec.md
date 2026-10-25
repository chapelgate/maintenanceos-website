# mw-04-monitor-retired-host

## Problem

website:monitor defaulted WEBSITE_CONTROL_PLANE to the retired Railway host and failed unless that host reported Postgres readiness.

## Cause

scripts/website-health-monitor.mjs hardcoded the Railway URL as the default control plane.

## Acceptance

- Monitor contains no rsfm-control-plane string.
- Control-plane Postgres/CORS checks run only when WEBSITE_CONTROL_PLANE is non-empty.
- scripts/measurement.test.mjs and retired-lead-host tests exit 0.
- src/config/site.ts unchanged.

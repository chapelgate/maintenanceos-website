# mw-123-observability-health-artifact

## Goal
Add an offline health artifact that records monitor config for the exact SHA without live HTTP probes or host changes.

## Acceptance
- npm run health:artifact writes health-artifact.json for HEAD.
- node --test scripts/health-artifact.test.mjs passes.
- Network stays false; railway default absent.

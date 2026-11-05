# mw-observability-release-cross-validation spec

## Goal
Cross-validation completeness 9/10: release.json, out/release.json, public/status.json, and health artifact cross-consistency independently validated.

## Acceptance
- public/release.json has all required fields with correct values
- out/release.json matches public/release.json fields
- public/status.json has all required fields matching release.json
- health artifact: records HEAD SHA, no uptime/SLA claims
- schema: 1, kind: "offline-health-artifact", mode: "offline-config", network: false
- `npm test`, lint, typecheck, build pass
- Public launch remains disabled; no deploy, live nginx, production, voice, or golden-line path changes

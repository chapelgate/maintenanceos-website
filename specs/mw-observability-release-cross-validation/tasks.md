# Tasks mw-observability-release-cross-validation

- [x] Implement observability release cross-validation test suite
- [x] Validate required fields in public/release.json, out/release.json
- [x] Validate public/status.json consistency with release.json
- [x] Validate health artifact: records HEAD SHA, redacts network/public claims
- [x] Validate no uptime/SLA claims in health artifact or release marker
- [x] Verify lint, typecheck, build pass locally before PR
- [x] Confirm public launch remains disabled and frozen paths are untouched

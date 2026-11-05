# Plan mw-observability-release-cross-validation

- Add test suite: scripts/observability-release-cross-validation.test.mjs (5 tests)
- Validate required fields in public/release.json, out/release.json
- Validate public/status.json consistency with release.json
- Validate health artifact: records HEAD SHA, redacts network/public claims
- Validate no uptime/SLA claims in health artifact or release marker
- Verify lint, typecheck, build pass locally before PR
- Confirm publicLaunch remains false and frozen paths untouched

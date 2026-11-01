# Spec: Observability Hardening — Logger Routing Gate

## Objective
Add regression tests that the bounded logger is used by preview-voice and integration-tokens (no direct console.warn), plus PII redaction and LOG_LEVEL verbosity.

## Acceptance Criteria
- logger-routes-through-bounded.test.mjs: logger exports debug/info/warn/error, sanitize redacts PII, ISO timestamp format, LOG_LEVEL control
- preview-voice-routes-test.test.mjs: preview-voice imports logger, uses logger.warn for Gemini voice unavailable, never console.warn directly
- integration-tokens-routes-test.test.mjs: integration-tokens imports logger, warns on MemoryTokenStore via logger.warn, never console.warn
- npm test 630/630; lint clean; typecheck clean; build green
- No frozen paths; publicLaunch false

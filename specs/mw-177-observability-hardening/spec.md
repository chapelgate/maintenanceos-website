# mw-177-observability-hardening

Add a bounded logger utility (/src/lib/logger.ts) that safely replaces raw console.{warn,error} calls in production code paths. Add scripts/observability-hardening.test.mjs that asserts: (1) src/lib/logger.ts exists and exports a logger with warn/info/debug/error methods; (2) src/lib/integration-tokens.ts and src/lib/preview-voice.ts still pass their existing test suites when logger is imported; (3) npm test remains 630/630 green and existing security locks unchanged. The logger should redact PII from meta arguments and never log secrets in production paths.

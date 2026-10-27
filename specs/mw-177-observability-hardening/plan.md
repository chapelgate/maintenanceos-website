# Plan
1. Create /src/lib/logger.ts with bounded console.{warn,error} replacement (PII redaction, no secrets).
2. Create scripts/observability-hardening.test.mjs that asserts logger module exists and has required methods.
3. Keep npm test 630/630 and existing security locks green.

# mw-178-observability-wire-logger

Wire the bounded logger from mw-177 into raw `console.warn` call sites in `src/lib/preview-voice.ts:76` and `src/lib/integration-tokens.ts:195` so production code paths never log through unmediated `console`. Add `scripts/observability-wire-logger.test.mjs` asserting both modules route warnings through the logger. Keep `npm test` 630/630 green and typecheck clean. No runtime behaviour change beyond bounded PII-redacted logging.

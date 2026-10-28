# Plan — mw-178-observability-wire-logger

1. Import and use the bounded logger in `src/lib/preview-voice.ts` replacing the raw `console.warn` in `warnVoice`.
2. Import and use the bounded logger in `src/lib/integration-tokens.ts` replacing the raw `console.warn` in `getTokenStore`.
3. Add `scripts/observability-wire-logger.test.mjs` asserting both modules route through the logger.
4. Run `npm test`, `tsc --noEmit`, `eslint .`; fix any failures.
5. Spec Kit converge; open non-draft PR (PR-zero); record in out/SLICES.md.

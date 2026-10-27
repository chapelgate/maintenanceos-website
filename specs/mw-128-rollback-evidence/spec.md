# mw-128-rollback-evidence

## Goal
Add a local SHA-bound rollback evidence artifact that proves the revert-only rollback plan without executing a revert or touching deploy paths.

## Acceptance
- npm run rollback:evidence writes rollback-evidence.json for HEAD.
- node --test scripts/rollback-evidence.test.mjs passes.
- Evidence sets executed false and forbids hard-reset/force-push/voice-line.

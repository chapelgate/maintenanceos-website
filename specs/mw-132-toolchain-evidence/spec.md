# mw-132-toolchain-evidence

## Goal
Add a local SHA-bound toolchain evidence artifact that proves lint and typecheck scripts exist for the current HEAD without claiming a live CI or deploy run.

## Acceptance
- npm run toolchain:evidence writes toolchain-evidence.json for HEAD.
- package.json exposes typecheck (tsc --noEmit) and toolchain:evidence.
- node --test scripts/toolchain-evidence.test.mjs passes.

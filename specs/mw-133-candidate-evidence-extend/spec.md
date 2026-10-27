# mw-133-candidate-evidence-extend

## Goal
Extend local candidate evidence so one SHA-bound artifact also proves secret-scan, rollback, health, release honesty, and lint scripts exist.

## Acceptance
- write-candidate-evidence.mjs checks the new script locks.
- node --test scripts/candidate-evidence.test.mjs passes.
- npm run candidate:evidence reports ok=true.

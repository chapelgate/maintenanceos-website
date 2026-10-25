# mw-34-observability-demo-scripts

## Problem

The site already has health, deploy, and rollback scripts, and a written synthetic demo. There is no local runner Andy can execute that prints the pre-launch walk and the bans, and no lock that the runner stays free of the golden-line number.

## Acceptance

- `scripts/synthetic-demo.mjs` prints the local walk and the four bans. It reads `src/config/site.ts` as text. It does not call the network or the golden line.
- `scripts/observability-suite.test.mjs` locks the existing monitor, verifier, and rollback sources, and locks the demo doc against publishing the golden-line number.
- `node --test scripts/observability-suite.test.mjs` passes.
- `node scripts/synthetic-demo.mjs` exits 0.

# mw-07-functional-smoke-lock
## Goal
Functional smoke test assertions match the current honest page copy on main. The smoke test must pass without modifying page copy to invent claims.

## Acceptance
- `node --test scripts/functional-smoke.mjs` exits 0
- No `[ANDY:]` markers added to source
- Page copy remains pre-launch honest, no commercial-live claims

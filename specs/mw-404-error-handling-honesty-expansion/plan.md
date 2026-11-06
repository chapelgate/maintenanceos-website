# Plan for mw-404: error handling honesty expansion

## Steps
1. Add `scripts/error-handling-honesty-expansion.test.mjs` with error-page honesty checks
2. Run `npm test` → PASS
3. Run `npm run lint` → clean
4. Run `npm run typecheck` → clean
5. Run `npm run build` → green
6. Commit specs + test change and push with Estate headers
7. Create PR ready for council merge
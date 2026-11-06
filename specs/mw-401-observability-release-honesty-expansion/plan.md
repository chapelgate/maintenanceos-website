# Plan for mw-401: observability release honesty expansion

## Steps
1. Add `scripts/observability-release-honesty-expansion.test.mjs` with cross-validation checks
2. Run `npm test` → PASS
3. Run `npm run lint` → clean (0 errors)
4. Run `npm run typecheck` → clean
5. Run `npm run build` → green
6. Commit and push with Estate headers
7. Create PR ready for council merge

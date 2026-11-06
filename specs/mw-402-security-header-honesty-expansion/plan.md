# Plan for mw-402: security header honesty expansion

## Steps
1. Add `scripts/security-header-honesty-expansion.test.mjs` with cross-page CSP and SRI checks
2. Run `npm test` → PASS
3. Run `npm run lint` → clean
4. Run `npm run typecheck` → clean
5. Run `npm run build` → green
6. Commit specs + test change and push with Estate headers
7. Create PR ready for council merge
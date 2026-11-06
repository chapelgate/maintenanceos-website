# Plan for mw-400: a11y heading hierarchy test coverage expansion

## Steps
1. Expand `scripts/a11y-heading-hierarchy.test.mjs` page list from 4 to 28 pages
2. Add new tests: exactly-one-h1-per-page, no-empty-heading-text
3. Run `npm test` → PASS
4. Run `npm run lint` → clean (0 errors)
5. Run `npm run typecheck` → clean
6. Run `npm run build` → green
7. Commit specs + test change and push with Estate headers
8. Create PR ready for council merge

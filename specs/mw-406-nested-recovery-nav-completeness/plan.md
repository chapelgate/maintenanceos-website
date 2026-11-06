# Plan for mw-406: nested recovery nav completeness expansion

## Steps
1. Add nested recovery nav tests for blog/help/compare/integrations/industries slug pages
2. Add recovery nav checks for error.tsx, global-error.tsx, not-found.tsx
3. Run `npm test` → PASS
4. Run `npm run lint` → clean (0 errors)
5. Run `npm run typecheck` → clean
6. Run `npm run build` → green
7. Commit specs + tests and push with Estate headers
8. Create PR ready for council merge

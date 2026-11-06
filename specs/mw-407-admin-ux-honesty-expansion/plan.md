# Plan for mw-407: admin UX honesty expansion

## Steps
1. Add admin-ux-honesty-expansion.test.mjs for admin/dashboard pages
2. Verify pre-launch documentation, noindex, no live KPI claims, trust/security recovery links
3. Run `npm test` → PASS
4. Run `npm run lint` → clean (0 errors)
5. Run `npm run typecheck` → clean
6. Run `npm run build` → green
7. Commit specs + tests and push with Estate headers
8. Create PR ready for council merge

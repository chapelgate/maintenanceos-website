# mw-386: Fix broken internal links in help articles — Plan

## Scope
Fix 7 relative markdown links in 2 help articles that produce 8 HTTP 404s on the live site.

## Steps
1. Edit `src/content/help/api-quickstart.mdx` — change 5 relative links (`./api-reference`, `./webhook-events`, `./api-rate-limits`, `./sandbox-guide`, `./api-migration`) to absolute `/help/` paths
2. Edit `src/content/help/integration-overview.mdx` — change 2 relative links (`./api-quickstart`, `./webhook-guide`) to absolute `/help/` paths
3. Add test `scripts/help-internal-links.test.mjs` to verify all internal help links resolve to exported pages
4. Run full test suite and build verification

## Dependencies
None — purely content/markdown fix.

## Risks
Low — no code changes, only markdown link corrections.
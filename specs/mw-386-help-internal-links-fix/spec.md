# mw-386: Fix broken internal links in help articles

## Problem
8 help articles contain relative markdown links (`./api-reference`, etc.) that resolve incorrectly on the live static site. From `/help/api-quickstart/`, a link `./api-reference` resolves to `/help/api-quickstart/api-reference/` (404) instead of `/help/api-reference/`.

Affected articles:
- `api-quickstart.mdx` — 5 relative links
- `integration-overview.mdx` — 2 relative links

## Solution
Change all relative `/help/` links to absolute paths starting with `/help/`.

## Acceptance Criteria
1. All internal `/help/` links in help articles resolve to exported HTML pages
2. `npm test` passes (630/630)
3. `npm run lint` clean
4. `npm run typecheck` clean
5. `npm run build` green (static export)
4. No frozen paths touched (deploy/**, live nginx, production DBs, golden line, IR deadlines, disclosure/redaction, EW portfolio, approved releases, live customers)
5. `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false

## Verification
- New test `scripts/help-internal-links.test.mjs` validates all internal help links resolve correctly
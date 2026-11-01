# mw-329 Help filter live status

## Goal
Help Centre search announces a live result count and offers a Clear help filter recovery path when no articles match (parity with FAQ mw-323).

## Acceptance
- `#help-result-count` with role=status aria-live=polite
- Empty state has Clear help filter button that resets input and restores all articles
- Test lock: scripts/help-filter-status.test.mjs
- No prices, buy-now, or public-launch claims
